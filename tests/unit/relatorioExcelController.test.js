const { criarRelatorioExcelController } = require('../../src/controllers/relatorioExcelController');

function contexto() {
    const registros = [{ id_movimentacao: 1 }];
    const dados = { cabecalhos: [], linhas: [], totalRegistros: 0 };
    const limpar = jest.fn().mockResolvedValue();
    const consultarHistorico = jest.fn().mockResolvedValue(registros);
    const prepararDadosRelatorioExcel = jest.fn().mockReturnValue(dados);
    const gerarRelatorioExcel = jest.fn().mockResolvedValue({ caminhoArquivo: '/temporario/arquivo.xlsx', limpar });
    const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        download: jest.fn((caminho, nome, opcoes, callback) => callback()),
        destroy: jest.fn()
    };
    const exportar = criarRelatorioExcelController({ consultarHistorico, prepararDadosRelatorioExcel, gerarRelatorioExcel });
    return { registros, dados, limpar, consultarHistorico, prepararDadosRelatorioExcel, gerarRelatorioExcel, res, exportar };
}

afterEach(() => jest.restoreAllMocks());

test('usa filtros da View, prepara os registros e envia o XLSX antes de limpar', async () => {
    const { exportar, res, consultarHistorico, prepararDadosRelatorioExcel, registros, gerarRelatorioExcel, dados, limpar } = contexto();
    let finalizar;
    const envio = new Promise(resolve => {
        res.download.mockImplementation((caminho, nome, opcoes, callback) => {
            finalizar = callback;
            resolve();
        });
    });
    const requisicao = exportar({ query: { categoria: '', dataInicio: '2026-09-01', dataFim: '2026-09-30' } }, res);
    await envio;
    expect(consultarHistorico).toHaveBeenCalledWith({ data_inicio: '2026-09-01', data_fim: '2026-09-30' });
    expect(prepararDadosRelatorioExcel).toHaveBeenCalledWith(registros);
    expect(gerarRelatorioExcel).toHaveBeenCalledWith(dados);
    expect(res.download).toHaveBeenCalledWith('/temporario/arquivo.xlsx', 'relatorio-movimentacoes.xlsx', {
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    }, expect.any(Function));
    expect(limpar).not.toHaveBeenCalled();
    finalizar();
    await requisicao;
    expect(limpar).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
});

test.each([
    { categoria: 'Telas' },
    { dataInicio: ['2026-09-01', '2026-09-02'] },
    { dataInicio: '2026-02-30' },
    { dataInicio: '2026-09-30', dataFim: '2026-09-01' },
    { outroFiltro: 'valor' }
])('rejeita filtros inválidos antes da consulta (%j)', async query => {
    const { exportar, res, consultarHistorico } = contexto();
    await exportar({ query }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(consultarHistorico).not.toHaveBeenCalled();
});

test('encaminha filtros do histórico e trata sua rejeição', async () => {
    const { exportar, res, consultarHistorico } = contexto();
    consultarHistorico.mockRejectedValue(Object.assign(new Error('interno'), { code: 'INVALID_FILTER' }));
    await exportar({ query: { id_produto: '2', tipo_movimentacao: 'invalid' } }, res);
    expect(consultarHistorico).toHaveBeenCalledWith(expect.objectContaining({ id_produto: '2', tipo_movimentacao: 'invalid' }));
    expect(res.status).toHaveBeenCalledWith(400);
});

test.each([
    ['consultarHistorico', undefined, 500],
    ['prepararDadosRelatorioExcel', undefined, 500],
    ['gerarRelatorioExcel', undefined, 500],
    ['gerarRelatorioExcel', 'EXPORT_TIMEOUT', 504],
    ['gerarRelatorioExcel', 'EXPORT_BUSY', 409]
])('trata falha de %s (%s) sem expor detalhes', async (dependencia, code, status) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const ctx = contexto();
    ctx[dependencia].mockRejectedValue(Object.assign(new Error('detalhe interno'), { code }));
    await ctx.exportar({}, ctx.res);
    expect(ctx.res.status).toHaveBeenCalledWith(status);
    expect(ctx.res.json).toHaveBeenCalledWith({ sucesso: false, mensagem: expect.not.stringContaining('detalhe interno') });
    expect(ctx.res.download).not.toHaveBeenCalled();
    expect(ctx.limpar).not.toHaveBeenCalled();
});

test.each([
    ['falha antes dos cabeçalhos', {}, 500, false],
    ['falha após envio parcial', { headersSent: true }, undefined, true],
    ['conexão interrompida', { destroyed: true }, undefined, false]
])('limpa os temporários após %s', async (_, estado, status, destroi) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { exportar, res, limpar } = contexto();
    res.download.mockImplementation((caminho, nome, opcoes, callback) => {
        Object.assign(res, estado);
        callback(new Error('falha de envio'));
    });
    await exportar({}, res);
    expect(limpar).toHaveBeenCalledTimes(1);
    if (status) expect(res.status).toHaveBeenCalledWith(status);
    else expect(res.status).not.toHaveBeenCalled();
    expect(res.destroy).toHaveBeenCalledTimes(Number(destroi));
});

test('limpa o XLSX se a conexão cair durante a geração', async () => {
    const { exportar, res, gerarRelatorioExcel, limpar } = contexto();
    gerarRelatorioExcel.mockImplementation(async () => {
        res.destroyed = true;
        return { caminhoArquivo: '/temporario/arquivo.xlsx', limpar };
    });
    await exportar({}, res);
    expect(limpar).toHaveBeenCalledTimes(1);
    expect(res.download).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
});

test('retorna conflito para outra requisição enquanto o gerador está ocupado', async () => {
    const { exportar, res, gerarRelatorioExcel, limpar } = contexto();
    const segundaResposta = contexto().res;
    let finalizar;
    gerarRelatorioExcel.mockImplementationOnce(() => new Promise(resolve => { finalizar = resolve; }));
    gerarRelatorioExcel.mockRejectedValueOnce(Object.assign(new Error('ocupado'), { code: 'EXPORT_BUSY' }));

    const primeira = exportar({}, res);
    await exportar({}, segundaResposta);
    expect(segundaResposta.status).toHaveBeenCalledWith(409);
    expect(segundaResposta.download).not.toHaveBeenCalled();
    finalizar({ caminhoArquivo: '/temporario/arquivo.xlsx', limpar });
    await primeira;
    expect(res.download).toHaveBeenCalledTimes(1);
    expect(limpar).toHaveBeenCalledTimes(1);
});
