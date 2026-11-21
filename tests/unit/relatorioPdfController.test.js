const { EventEmitter } = require('node:events');
const { criarRelatorioPdfController } = require('../../src/controllers/relatorioPdfController');

function criarCenario() {
    const limpar = jest.fn().mockResolvedValue(undefined);
    const consultarHistorico = jest.fn().mockResolvedValue([{ id_movimentacao: 7, sku_produto: '001' }]);
    const gerarRelatorioPdf = jest.fn().mockResolvedValue({ caminhoArquivo: '/temporario/teste.pdf', limpar });
    const res = Object.assign(new EventEmitter(), {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        removeHeader: jest.fn(),
        destroy: jest.fn(),
        download: jest.fn((caminho, nome, opcoes, callback) => callback())
    });
    const exportar = criarRelatorioPdfController({ consultarHistorico, gerarRelatorioPdf });
    return { exportar, consultarHistorico, gerarRelatorioPdf, limpar, res };
}

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

test('encaminha o período e os dados preparados, aguardando o envio para limpar', async () => {
    const { exportar, consultarHistorico, gerarRelatorioPdf, limpar, res } = criarCenario();
    let concluir;
    const iniciouEnvio = new Promise(resolve => {
        res.download.mockImplementation((caminho, nome, opcoes, callback) => {
            concluir = callback;
            resolve();
        });
    });
    const query = { data_inicio: '2026-09-01', data_fim: '2026-09-30' };
    const solicitacao = exportar({ query }, res);
    await iniciouEnvio;

    expect(consultarHistorico).toHaveBeenCalledWith(query);
    expect(gerarRelatorioPdf).toHaveBeenCalledWith({
        colunas: expect.arrayContaining([{ campo: 'sku_produto', titulo: 'SKU' }]),
        linhas: [[7, null, '001', null, null, null, null, null]]
    }, { signal: expect.any(AbortSignal) });
    expect(res.download).toHaveBeenCalledWith('/temporario/teste.pdf', 'relatorio-movimentacoes.pdf',
        { headers: { 'Content-Type': 'application/pdf' } }, expect.any(Function));
    expect(limpar).not.toHaveBeenCalled();

    concluir();
    await solicitacao;
    expect(limpar).toHaveBeenCalledTimes(1);
});

test.each([
    { categoria: 'Telas' },
    { data_inicio: ['2026-09-01', '2026-09-02'] },
    { data_fim: 20260930 }
])('recusa filtros incompatíveis antes da consulta (%j)', async query => {
    const { exportar, consultarHistorico, res } = criarCenario();
    await exportar({ query }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(consultarHistorico).not.toHaveBeenCalled();
});

test('encaminha cabeçalhos e lista vazia para o serviço quando não há registros', async () => {
    const { exportar, consultarHistorico, gerarRelatorioPdf, res } = criarCenario();
    consultarHistorico.mockResolvedValueOnce([]);
    await exportar({}, res);
    expect(gerarRelatorioPdf).toHaveBeenCalledWith({
        colunas: expect.arrayContaining([{ campo: 'id_movimentacao', titulo: 'Código' }]),
        linhas: []
    }, { signal: expect.any(AbortSignal) });
});

test.each(['consulta', 'preparação', 'geração'])('trata falha de %s sem expor detalhes internos', async etapa => {
    const { exportar, consultarHistorico, gerarRelatorioPdf, limpar, res } = criarCenario();
    if (etapa === 'consulta') consultarHistorico.mockRejectedValueOnce(new Error('erro interno'));
    if (etapa === 'preparação') consultarHistorico.mockResolvedValueOnce([null]);
    if (etapa === 'geração') gerarRelatorioPdf.mockRejectedValueOnce(new Error('erro interno'));

    await exportar({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ sucesso: false, mensagem: 'Não foi possível exportar o PDF. Tente novamente.' });
    expect(res.download).not.toHaveBeenCalled();
    expect(limpar).not.toHaveBeenCalled();
});

test.each([
    ['antes dos cabeçalhos', {}, 500, false],
    ['depois de iniciar o envio', { headersSent: true }, undefined, true],
    ['após desconexão', { destroyed: true }, undefined, false]
])('limpa os recursos após falha %s', async (_, estado, status, encerraConexao) => {
    const { exportar, limpar, res } = criarCenario();
    res.download.mockImplementationOnce((caminho, nome, opcoes, callback) => {
        Object.assign(res, estado);
        callback(new Error('falha de envio'));
    });

    await exportar({}, res);

    expect(limpar).toHaveBeenCalledTimes(1);
    if (status) {
        expect(res.status).toHaveBeenCalledWith(status);
        expect(res.removeHeader).toHaveBeenCalledWith('Content-Type');
    } else {
        expect(res.status).not.toHaveBeenCalled();
    }
    expect(res.destroy).toHaveBeenCalledTimes(Number(encerraConexao));
});

test('limpa o arquivo quando a conexão cai durante a geração', async () => {
    const { exportar, gerarRelatorioPdf, limpar, res } = criarCenario();
    gerarRelatorioPdf.mockImplementationOnce(async (dados, { signal }) => {
        res.destroyed = true;
        res.emit('close');
        expect(signal.aborted).toBe(true);
        return { caminhoArquivo: '/temporario/teste.pdf', limpar };
    });
    await exportar({}, res);
    expect(limpar).toHaveBeenCalledTimes(1);
    expect(res.download).not.toHaveBeenCalled();
});

test('exige a consulta e o serviço gerador para criar o handler', () => {
    expect(() => criarRelatorioPdfController({ consultarHistorico() {} })).toThrow(TypeError);
});
