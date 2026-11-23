
const { fork } = require('node:child_process');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { setTimeout: esperar } = require('node:timers/promises');

const MAX_ENTRADA = 128 * 1024 * 1024;
const MAX_CELULA = 32767;
let ocupado = false;

const ARQUIVOS = Object.freeze({
    movimentacoes: 'relatorio-movimentacoes.pdf',
    estoque: 'relatorio-estoque.pdf',
    produtos: 'relatorio-produtos.pdf'
});

function falha(code, message) {
    return Object.assign(new Error(message), { code });
}

async function limparTemporarios(diretorio, entrada, saida) {
    for (let tentativa = 0; ; tentativa++) {
        try {
            await fsp.rm(entrada, { force: true });
            await fsp.rm(saida, { force: true });
            await fsp.rmdir(diretorio);
            return;
        } catch (erro) {
            if (
                tentativa === 4 ||
                !['EBUSY', 'ENOTEMPTY', 'EPERM'].includes(erro.code)
            ) {
                throw erro;
            }

            await esperar(50 * (tentativa + 1));
        }
    }
}

function validarCelula(valor) {
    if (valor === null || Number.isFinite(valor)) return;

    if (
        typeof valor === 'string' &&
        valor.length <= MAX_CELULA &&
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(valor)
    ) {
        return;
    }

    if (valor instanceof Date && Number.isFinite(valor.getTime())) return;

    throw falha('INVALID_DATA', 'O relatório contém uma célula inválida.');
}

async function* serializar(tipo, colunas, linhas, sinal) {
    const cabecalho = JSON.stringify({
        tipo,
        titulos: colunas.map(({ titulo }) => titulo)
    }) + '\n';

    let bytes = Buffer.byteLength(cabecalho);
    yield cabecalho;

    for (const linha of linhas) {
        sinal.throwIfAborted();

        if (!Array.isArray(linha) || linha.length !== colunas.length) {
            throw falha(
                'INVALID_DATA',
                'Cada linha deve corresponder às colunas do relatório.'
            );
        }

        for (const valor of linha) validarCelula(valor);

        const texto = JSON.stringify(linha) + '\n';
        bytes += Buffer.byteLength(texto);

        if (bytes > MAX_ENTRADA) {
            throw falha('INPUT_LIMIT', 'O relatório excede o limite de entrada.');
        }

        yield texto;
    }
}

function executarWorker(entrada, saida, tipo, sinal) {
    return new Promise((resolve, reject) => {
        sinal.throwIfAborted();

        const filho = fork(
            path.join(__dirname, '../workers/relatorioPdfWorker.js'),
            [entrada, saida, tipo],
            {
                execArgv: ['--max-old-space-size=128'],
                env: {
                    SystemRoot: process.env.SystemRoot,
                    TEMP: os.tmpdir(),
                    TMP: os.tmpdir()
                },
                stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
                windowsHide: true
            }
        );

        let relatorio;
        let erro;

        const interromper = () => filho.kill('SIGKILL');

        sinal.addEventListener('abort', interromper, { once: true });

        filho.on('message', mensagem => {
            if (
                mensagem.tipo === 'memoria' &&
                mensagem.rss > 256 * 1024 * 1024
            ) {
                erro = falha(
                    'MEMORY_LIMIT',
                    'O processo PDF excedeu o limite de memória monitorado.'
                );
                interromper();
            }

            if (mensagem.tipo === 'concluido') relatorio = mensagem;

            if (mensagem.tipo === 'erro' && !erro) {
                erro = falha(
                    mensagem.code === 'UNSUPPORTED_TEXT'
                        ? mensagem.code
                        : 'WORKER_ERROR',
                    mensagem.message || 'O processo PDF não conseguiu gerar o relatório.'
                );
            }
        });

        filho.on('error', () => {
            erro ??= falha(
                'WORKER_ERROR',
                'Não foi possível executar o processo PDF.'
            );
        });

        filho.once('close', codigo => {
            sinal.removeEventListener('abort', interromper);

            if (sinal.aborted) reject(sinal.reason);
            else if (erro || codigo !== 0 || !relatorio) {
                reject(
                    erro ||
                    falha(
                        'WORKER_EXIT',
                        'O processo PDF foi encerrado antes de concluir.'
                    )
                );
            } else {
                resolve(relatorio);
            }
        });
    });
}

async function gerarRelatorioPdf(dados, { timeoutMs = 120000, signal } = {}) {
    const { tipo, colunas, linhas } = dados ?? {};

    if (
        !Object.hasOwn(ARQUIVOS, tipo) ||
        !Array.isArray(colunas) ||
        !Array.isArray(linhas) ||
        colunas.length === 0 ||
        colunas.length > 8 ||
        colunas.some(coluna =>
            !coluna ||
            typeof coluna.titulo !== 'string' ||
            !coluna.titulo.trim() ||
            coluna.titulo.length > 80
        )
    ) {
        throw falha('INVALID_DATA', 'Informe um tipo e dados válidos para o relatório.');
    }

    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 600000) {
        throw falha('INVALID_OPTIONS', 'Tempo limite inválido.');
    }

    if (ocupado) {
        throw falha('EXPORT_BUSY', 'Já existe uma geração PDF em andamento.');
    }

    const prazo = AbortSignal.timeout(timeoutMs);
    const sinal = signal ? AbortSignal.any([prazo, signal]) : prazo;

    ocupado = true;

    let diretorio;
    let entrada;
    let caminhoArquivo;
    let limpeza;

    const limpar = () => {
        if (!diretorio) return Promise.resolve();

        limpeza ??= limparTemporarios(diretorio, entrada, caminhoArquivo)
            .catch(erro => {
                limpeza = undefined;
                throw erro;
            });

        return limpeza;
    };

    try {
        sinal.throwIfAborted();

        diretorio = await fsp.mkdtemp(
            path.join(os.tmpdir(), 'stockmaster-rf20-')
        );

        entrada = path.join(diretorio, 'entrada.jsonl');
        caminhoArquivo = path.join(diretorio, ARQUIVOS[tipo]);

        const destino = fs.createWriteStream(entrada, {
            flags: 'wx',
            mode: 0o600
        });

        const entradaFechada = new Promise(resolve =>
            destino.once('close', resolve)
        );

        try {
            await pipeline(
                serializar(tipo, colunas, linhas, sinal),
                destino,
                { signal: sinal }
            );
        } finally {
            await entradaFechada;
        }

        const resultado = await executarWorker(
            entrada,
            caminhoArquivo,
            tipo,
            sinal
        );

        await fsp.unlink(entrada);
        sinal.throwIfAborted();

        return {
            caminhoArquivo,
            limpar,
            metricas: resultado.metricas
        };
    } catch (erro) {
        await limpar();

        if (prazo.aborted && sinal.reason === prazo.reason) {
            throw falha(
                'EXPORT_TIMEOUT',
                'A geração PDF excedeu o tempo limite.'
            );
        }

        if (sinal.aborted) {
            throw falha(
                'EXPORT_ABORTED',
                'A geração PDF foi interrompida.'
            );
        }

        throw erro;
    } finally {
        ocupado = false;
    }
}

module.exports = { gerarRelatorioPdf };
