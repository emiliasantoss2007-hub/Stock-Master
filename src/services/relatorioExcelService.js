'use strict';

const { fork } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

// Contrato provisório do resultado preparado pelo Model; não consulta/prepara registros.
const CABECALHOS = Object.freeze([
    'Código', 'Produto', 'SKU', 'Tipo de movimentação',
    'Quantidade', 'Data', 'Responsável', 'Justificativa'
]);
const MAX_LINHAS_ABA = 1048575; // XLSX: 1.048.576 linhas, incluindo o cabeçalho.
const MAX_ENTRADA_BYTES = 256 * 1024 * 1024;
let ocupada = false;

function falha(code, message) {
    return Object.assign(new Error(message), { code });
}

function validarContrato(dados) {
    if (!dados || !Array.isArray(dados.cabecalhos) ||
        dados.cabecalhos.length !== CABECALHOS.length ||
        !CABECALHOS.every((titulo, i) => dados.cabecalhos[i] === titulo) ||
        !Array.isArray(dados.linhas) ||
        !Number.isSafeInteger(dados.totalRegistros) ||
        dados.totalRegistros !== dados.linhas.length) {
        throw falha('INVALID_DATA', 'Esperado { cabecalhos, linhas, totalRegistros } com oito colunas na ordem oficial.');
    }
}

function validarLinha(linha) {
    if (!Array.isArray(linha) || linha.length !== 8) {
        throw falha('INVALID_DATA', 'Cada linha deve conter exatamente oito células.');
    }
    for (const [i, valor] of linha.entries()) {
        if (valor === '') continue;
        if (i === 5) {
            // Strings ISO sem fuso são tratadas como UTC, sem depender do fuso do host.
            if (valor instanceof Date && !Number.isFinite(valor.getTime())) throw falha('INVALID_DATA', 'Data inválida.');
            const texto = valor instanceof Date ? valor.toISOString() : valor;
            if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(texto)) {
                throw falha('INVALID_DATA', 'Data deve ser Date válido ou string ISO.');
            }
            const data = new Date(texto.length === 10 ? `${texto}T00:00:00Z` : /Z$|[+-]\d{2}:\d{2}$/.test(texto) ? texto : `${texto.replace(' ', 'T')}Z`);
            const dia = texto.slice(0, 10);
            const calendario = new Date(`${dia}T00:00:00Z`);
            if (!Number.isFinite(data.getTime()) || !Number.isFinite(calendario.getTime()) || calendario.toISOString().slice(0, 10) !== dia) {
                throw falha('INVALID_DATA', 'Data inválida.');
            }
        } else if (i === 4) {
            if (typeof valor !== 'number' || !Number.isSafeInteger(valor) || valor < 0 || valor > 999999999999999) {
                throw falha('INVALID_DATA', 'Quantidade deve ser inteiro numérico não negativo ou campo vazio.');
            }
        } else if (i === 0 && typeof valor === 'number') {
            if (!Number.isSafeInteger(valor) || valor < 0) throw falha('INVALID_DATA', 'Código numérico inválido.');
        } else if (typeof valor !== 'string' || valor.length > 32767 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(valor)) {
            throw falha('INVALID_DATA', 'Texto inválido, objeto de fórmula ou texto além do limite XLSX.');
        }
    }
}

async function removerTemporario(diretorio) {
    // Remove exclusivamente o diretório privado retornado por mkdtemp neste serviço.
    const prefixo = path.join(os.tmpdir(), 'stockmaster-rf19-');
    if (path.dirname(diretorio) !== path.resolve(os.tmpdir()) || !diretorio.startsWith(prefixo)) {
        throw falha('INVALID_TEMP_PATH', 'Diretório temporário fora da área da exportação.');
    }
    await fs.rm(diretorio, { recursive: true, force: true });
}

async function gravarEntrada(dados, arquivo, prazo) {
    const handle = await fs.open(arquivo, 'wx', 0o600);
    let bytes = 0;
    let lote = '';
    try {
        for (let i = 0; i < dados.linhas.length; i++) {
            if (performance.now() > prazo) throw falha('EXPORT_TIMEOUT', 'Tempo limite da exportação excedido.');
            validarLinha(dados.linhas[i]);
            const texto = `${JSON.stringify(dados.linhas[i])}\n`;
            bytes += Buffer.byteLength(texto);
            if (bytes > MAX_ENTRADA_BYTES) throw falha('INPUT_LIMIT', 'Entrada excede 256 MiB; divida o relatório.');
            lote += texto;
            if (lote.length >= 65536 || i % 256 === 255) {
                await handle.writeFile(lote);
                lote = '';
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        if (lote) await handle.writeFile(lote);
    } finally {
        await handle.close();
    }
}

function executarProcesso(entrada, saida, opcoes, prazo) {
    return new Promise((resolve, reject) => {
        const filho = fork(path.join(__dirname, '../workers/relatorioExcelWorker.js'),
            [entrada, saida, String(opcoes.linhasPorAba)], {
                execArgv: ['--max-old-space-size=128'],
                // Não herda configurações Node nem credenciais do banco de dados.
                env: { SystemRoot: process.env.SystemRoot, TEMP: os.tmpdir(), TMP: os.tmpdir() },
                stdio: ['ignore', 'ignore', 'ignore', 'ipc'], windowsHide: true
            });
        let resultado;
        let erro;
        let finalizado = false;
        let ultimoSinal = performance.now();
        function interromper(causa) {
            if (!erro) erro = causa;
            filho.kill('SIGKILL');
        }
        const timer = setTimeout(() => interromper(falha('EXPORT_TIMEOUT', 'Tempo limite da exportação excedido.')),
            Math.max(1, prazo - performance.now()));
        const watchdog = setInterval(() => {
            if (performance.now() - ultimoSinal > 10000) interromper(falha('WORKER_UNRESPONSIVE', 'Processo de exportação sem resposta.'));
        }, 1000);
        filho.on('message', mensagem => {
            ultimoSinal = performance.now();
            if (mensagem.tipo === 'memoria' && mensagem.rss > opcoes.maxRssMB * 1024 * 1024) {
                interromper(falha('MEMORY_LIMIT', 'Processo de exportação excedeu o limite monitorado de memória.'));
            } else if (mensagem.tipo === 'concluido') resultado = mensagem;
            else if (mensagem.tipo === 'erro') erro = falha('WORKER_ERROR', mensagem.message);
        });
        const concluir = (causa) => {
            if (finalizado) return;
            finalizado = true;
            clearTimeout(timer);
            clearInterval(watchdog);
            if (causa || erro) reject(erro || causa);
            else resolve(resultado);
        };
        filho.on('error', causa => concluir(falha('WORKER_ERROR', causa.message)));
        filho.on('close', (codigo, sinal) => {
            concluir(codigo !== 0 || !resultado ? falha('WORKER_EXIT', `Processo de exportação encerrado (${codigo ?? sinal}).`) : null);
        });
    });
}

/** Recebe exclusivamente o resultado preparado pelo Model. O consumidor deve chamar limpar() em finally. */
async function gerarRelatorioExcel(dados, opcoes = {}) {
    if (!opcoes || typeof opcoes !== 'object' || Array.isArray(opcoes)) throw falha('INVALID_OPTIONS', 'Opções devem ser um objeto.');
    if (ocupada) throw falha('EXPORT_BUSY', 'Já existe uma exportação em andamento neste processo.');
    validarContrato(dados);
    const config = {
        linhasPorAba: opcoes.linhasPorAba ?? MAX_LINHAS_ABA,
        timeoutMs: opcoes.timeoutMs ?? 120000,
        maxRssMB: opcoes.maxRssMB ?? 256
    };
    if (!Number.isInteger(config.linhasPorAba) || config.linhasPorAba < 1 || config.linhasPorAba > MAX_LINHAS_ABA ||
        !Number.isInteger(config.timeoutMs) || config.timeoutMs < 1 || config.timeoutMs > 600000 ||
        !Number.isInteger(config.maxRssMB) || config.maxRssMB < 32 || config.maxRssMB > 512) {
        throw falha('INVALID_OPTIONS', 'Opções de limite inválidas.');
    }
    ocupada = true;
    const inicio = performance.now();
    let diretorio;
    try {
        diretorio = await fs.mkdtemp(path.join(os.tmpdir(), 'stockmaster-rf19-'));
        const entrada = path.join(diretorio, 'entrada.jsonl');
        const caminhoArquivo = path.join(diretorio, 'movimentacoes.xlsx');
        const prazo = inicio + config.timeoutMs;
        await gravarEntrada(dados, entrada, prazo);
        const resultado = await executarProcesso(entrada, caminhoArquivo, config, prazo);
        if (resultado.totalRegistros !== dados.totalRegistros) throw falha('WORKER_ERROR', 'Contagem de registros divergente.');
        await fs.unlink(entrada);
        return {
            caminhoArquivo,
            totalRegistros: resultado.totalRegistros,
            metricas: { ...resultado.metricas, duracaoTotalMs: Math.round(performance.now() - inicio) },
            limpar: () => removerTemporario(diretorio)
        };
    } catch (erro) {
        if (diretorio) await removerTemporario(diretorio);
        throw erro;
    } finally {
        ocupada = false;
    }
}

module.exports = { gerarRelatorioExcel, CABECALHOS };
