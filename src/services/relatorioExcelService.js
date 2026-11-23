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



function validarContrato(dados, opcoes = {}) {
    const cabecalhosEsperados = opcoes.cabecalhos || CABECALHOS;

    if (
        !dados ||
        !Array.isArray(dados.cabecalhos) ||
        dados.cabecalhos.length === 0 ||
        dados.cabecalhos.length > 50 ||
        dados.cabecalhos.some(
            titulo => typeof titulo !== 'string' || !titulo.trim()
        ) ||
        new Set(dados.cabecalhos).size !== dados.cabecalhos.length ||
        dados.cabecalhos.length !== cabecalhosEsperados.length ||
        dados.cabecalhos.some(
            (titulo, indice) => titulo !== cabecalhosEsperados[indice]
        ) ||
        !Array.isArray(dados.linhas) ||
        !Number.isSafeInteger(dados.totalRegistros) ||
        dados.totalRegistros !== dados.linhas.length
    ) {
        throw falha('INVALID_DATA', 'Contrato de dados do relatório Excel inválido.');
    }

    for (const linha of dados.linhas) {
        if (!Array.isArray(linha) || linha.length !== dados.cabecalhos.length) {
            throw falha('INVALID_DATA', 'Cada linha deve corresponder à quantidade de cabeçalhos.');
        }
    }
}

function dataValida(valor) {
    if (valor instanceof Date) {
        return Number.isFinite(valor.getTime());
    }

    if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(valor)
    ) {
        return false;
    }

    const dia = valor.slice(0, 10);
    const dataDia = new Date(`${dia}T00:00:00.000Z`);

    if (
        !Number.isFinite(dataDia.getTime()) ||
        dataDia.toISOString().slice(0, 10) !== dia
    ) {
        return false;
    }

    if (valor.length === 10) return true;

    const normalizada = valor.includes(' ')
        ? valor.replace(' ', 'T')
        : valor;

    const comFuso = /Z$|[+-]\d{2}:\d{2}$/.test(normalizada)
        ? normalizada
        : `${normalizada}Z`;

    return Number.isFinite(new Date(comFuso).getTime());
}

function validarLinha(linha, opcoes = {}) {
    if (!Array.isArray(linha) || linha.length === 0 || linha.length > 50) {
        throw falha('INVALID_DATA', 'Quantidade de células inválida.');
    }

    const colunasData = opcoes.colunasData ?? [5];
    const colunasInteiras = opcoes.colunasInteiras ?? [0, 4];
    const colunasMoeda = opcoes.colunasMoeda ?? [];

    for (const indice of [...colunasData, ...colunasInteiras, ...colunasMoeda]) {
        if (!Number.isInteger(indice) || indice < 0 || indice >= linha.length) {
            throw falha('INVALID_DATA', 'Configuração de coluna inválida.');
        }
    }

    for (let indice = 0; indice < linha.length; indice++) {
        const valor = linha[indice];

        if (valor === '') continue;

        if (colunasData.includes(indice)) {
            if (!dataValida(valor)) {
                throw falha('INVALID_DATA', 'Data inválida.');
            }
            continue;
        }

        if (colunasInteiras.includes(indice)) {
            if (
                typeof valor !== 'number' ||
                !Number.isSafeInteger(valor) ||
                valor < 0 ||
                valor > 999999999999999
            ) {
                throw falha('INVALID_DATA', 'Número inteiro inválido.');
            }
            continue;
        }

        if (colunasMoeda.includes(indice)) {
            if (
                typeof valor !== 'number' ||
                !Number.isFinite(valor) ||
                valor < 0 ||
                valor > 999999999999999
            ) {
                throw falha('INVALID_DATA', 'Valor monetário inválido.');
            }
            continue;
        }

        if (valor instanceof Date) {
            if (!Number.isFinite(valor.getTime())) {
                throw falha('INVALID_DATA', 'Data inválida.');
            }
            continue;
        }

        if (typeof valor === 'number') {
            if (!Number.isFinite(valor) || Math.abs(valor) > 999999999999999) {
                throw falha('INVALID_DATA', 'Número inválido.');
            }
            continue;
        }

        if (
            typeof valor !== 'string' ||
            valor.length > 32767 ||
            /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(valor)
        ) {
            throw falha('INVALID_DATA', 'Texto inválido ou além do limite XLSX.');
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

async function gravarEntrada(dados, arquivo, prazo, opcoes) {
    const handle = await fs.open(arquivo, 'wx', 0o600);
    let bytes = 0;
    let lote = '';
    try {
        for (let i = 0; i < dados.linhas.length; i++) {
            if (performance.now() > prazo) throw falha('EXPORT_TIMEOUT', 'Tempo limite da exportação excedido.');
            validarLinha(dados.linhas[i], opcoes);
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

function executarProcesso(entrada, saida, opcoes, prazo, dados) {
    return new Promise((resolve, reject) => {
        const filho = fork(path.join(__dirname, '../workers/relatorioExcelWorker.js'),
            [
    entrada,
    saida,
    String(opcoes.linhasPorAba),
    JSON.stringify({
        cabecalhos: dados.cabecalhos,
        nomeAba: opcoes.nomeAba || 'Movimentações',
        larguras: opcoes.larguras || [12, 32, 22, 24, 14, 23, 28, 55],
        colunasData: opcoes.colunasData || [5],
        colunasInteiras: opcoes.colunasInteiras || [0, 4],
        colunasMoeda: opcoes.colunasMoeda || []
    })
],

{
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
    validarContrato(dados, opcoes);
    const config = {
    linhasPorAba: opcoes.linhasPorAba ?? MAX_LINHAS_ABA,
    timeoutMs: opcoes.timeoutMs ?? 120000,
    maxRssMB: opcoes.maxRssMB ?? 256,
    nomeAba: opcoes.nomeAba,
    larguras: opcoes.larguras,
    colunasData: opcoes.colunasData,
    colunasInteiras: opcoes.colunasInteiras,
    colunasMoeda: opcoes.colunasMoeda
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
        await gravarEntrada(dados, entrada, prazo, config);
        const resultado = await executarProcesso(entrada, caminhoArquivo, config, prazo, dados);
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
