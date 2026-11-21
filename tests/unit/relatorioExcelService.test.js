'use strict';

jest.mock('node:child_process', () => ({ fork: jest.fn() }));
const { EventEmitter } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const { fork } = require('node:child_process');
const { gerarRelatorioExcel, CABECALHOS } = require('../../src/services/relatorioExcelService');
const dados = () => ({ cabecalhos: [...CABECALHOS], linhas: [], totalRegistros: 0 });
let temporario;
let filho;
beforeEach(() => {
    temporario = undefined;
    fork.mockImplementation((script, args) => {
        temporario = path.dirname(args[0]);
        filho = new EventEmitter();
        filho.kill = jest.fn(() => { setImmediate(() => filho.emit('close', null, 'SIGKILL')); return true; });
        return filho;
    });
});
async function aguardarFilho() {
    while (!temporario) await new Promise(resolve => setImmediate(resolve));
}
async function conferirLimpeza(promessa, code) {
    await expect(promessa).rejects.toMatchObject({ code });
    await expect(fs.access(temporario)).rejects.toMatchObject({ code: 'ENOENT' });
}

test('falha do filho não encerra processo principal e limpa os arquivos', async () => {
    const promessa = gerarRelatorioExcel(dados());
    const rejeicao = conferirLimpeza(promessa, 'WORKER_EXIT');
    await aguardarFilho();
    filho.emit('close', 1, null);
    await rejeicao;
    expect(fork.mock.calls.at(-1)[2].execArgv).toEqual(['--max-old-space-size=128']);
    expect(fork.mock.calls.at(-1)[2].env.DB_PASSWORD).toBeUndefined();
});

test('erro de inicialização do processo é tratado', async () => {
    const promessa = gerarRelatorioExcel(dados());
    const rejeicao = conferirLimpeza(promessa, 'WORKER_ERROR');
    await aguardarFilho();
    filho.emit('error', new Error('spawn falhou'));
    await rejeicao;
});

test('watchdog encerra filho acima do limite RSS e aguarda encerramento antes da limpeza', async () => {
    const promessa = gerarRelatorioExcel(dados());
    const rejeicao = conferirLimpeza(promessa, 'MEMORY_LIMIT');
    await aguardarFilho();
    filho.emit('message', { tipo: 'memoria', rss: 257 * 1024 * 1024 });
    await rejeicao;
    expect(filho.kill).toHaveBeenCalledWith('SIGKILL');
});

test('timeout encerra filho e remove o arquivo parcial', async () => {
    const promessa = gerarRelatorioExcel(dados(), { timeoutMs: 100 });
    const rejeicao = conferirLimpeza(promessa, 'EXPORT_TIMEOUT');
    await aguardarFilho();
    await fs.writeFile(path.join(temporario, 'movimentacoes.xlsx'), 'parcial');
    await rejeicao;
    expect(filho.kill).toHaveBeenCalled();
});
