jest.mock('../../src/config/database', () => ({ query: jest.fn() }));

const express = require('express');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const connection = require('../../src/config/database');
const { consultarHistorico } = require('../../src/models/movimentacaoModel');
const { criarRelatorioPdfController } = require('../../src/controllers/relatorioPdfController');
const autenticar = require('../../src/middlewares/produtoAuth');
const autorizar = require('../../src/middlewares/adminOnly');
const sessoes = require('../../src/services/sessaoService');
const relatorioPdfRoutes = require('../../src/routes/relatorioPdfRoutes');

const gerarRelatorioPdf = jest.fn();
let server;
let url;
let admin;
let tecnico;

beforeAll(async () => {
    admin = sessoes.criar({ id_nivel_acesso: 1 });
    tecnico = sessoes.criar({ id_nivel_acesso: 2 });
    const app = express();
    app.use('/api', relatorioPdfRoutes);
    app.get('/teste/exportacao-pdf', autenticar, autorizar,
        criarRelatorioPdfController({ consultarHistorico, gerarRelatorioPdf }));
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    url = `http://127.0.0.1:${server.address().port}/teste/exportacao-pdf`;
});

beforeEach(() => {
    connection.query.mockReset();
    gerarRelatorioPdf.mockReset();
});

afterAll(async () => {
    sessoes.encerrar(admin);
    sessoes.encerrar(tecnico);
    if (server) await new Promise(resolve => server.close(resolve));
});

function solicitar(token, query = '') {
    return fetch(url + query, {
        headers: token ? { cookie: `stockmaster_session=${token}` } : { 'X-User': '{"id_nivel_acesso":1}' }
    });
}

function solicitarRotaReal(token) {
    return fetch(new URL('/api/relatorio/movimentacoes/pdf', url), {
        headers: token ? { cookie: `stockmaster_session=${token}` } : {}
    });
}

test('protege a rota real antes de consultar o histórico', async () => {
    expect((await solicitarRotaReal()).status).toBe(401);
    expect((await solicitarRotaReal(tecnico)).status).toBe(403);
    expect(connection.query).not.toHaveBeenCalled();
});

test('envia um PDF real e limpa o temporário pela rota protegida', async () => {
    const listar = async () => (await fs.readdir(os.tmpdir())).filter(nome => nome.startsWith('stockmaster-rf20-')).sort();
    const antes = await listar();
    connection.query.mockImplementationOnce((sql, parametros, callback) => callback(null, []));
    const resposta = await solicitarRotaReal(admin);
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get('content-type')).toBe('application/pdf');
    expect(resposta.headers.get('content-disposition')).toBe('attachment; filename="relatorio-movimentacoes.pdf"');
    const bytes = Buffer.from(await resposta.arrayBuffer());
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(bytes.subarray(-16).toString()).toMatch(/%%EOF\s*$/);
    expect(connection.query).toHaveBeenCalledTimes(1);
    for (let tentativa = 0; tentativa < 40; tentativa++) {
        if (JSON.stringify(await listar()) === JSON.stringify(antes)) break;
        await new Promise(resolve => setTimeout(resolve, 25));
    }
    expect(await listar()).toEqual(antes);
}, 10000);

test('bloqueia identidade declarada sem sessão e técnico autenticado', async () => {
    expect((await solicitar()).status).toBe(401);
    expect((await solicitar(tecnico)).status).toBe(403);
    expect(connection.query).not.toHaveBeenCalled();
    expect(gerarRelatorioPdf).not.toHaveBeenCalled();
});

test.each(['?data_inicio=2026-02-30', '?data_inicio=2026-09-30&data_fim=2026-09-01'])(
    'recusa período inválido usando a validação do Model de histórico (%s)', async query => {
        expect((await solicitar(admin, query)).status).toBe(400);
        expect(connection.query).not.toHaveBeenCalled();
        expect(gerarRelatorioPdf).not.toHaveBeenCalled();
    }
);

test('consulta o histórico, serve o arquivo simulado e libera o temporário', async () => {
    const diretorio = await fs.mkdtemp(path.join(os.tmpdir(), 'stockmaster-pdf-controller-'));
    const caminhoArquivo = path.join(diretorio, 'teste.pdf');
    const conteudo = 'Conteúdo de teste do envio HTTP';
    try {
        await fs.writeFile(caminhoArquivo, conteudo);
        let limpo;
        const limpeza = new Promise(resolve => { limpo = resolve; });
        const limpar = jest.fn(async () => {
            try {
                await fs.unlink(caminhoArquivo);
            } finally {
                limpo();
            }
        });
        gerarRelatorioPdf.mockResolvedValueOnce({ caminhoArquivo, limpar });
        const data = new Date('2026-09-09T16:30:00Z');
        connection.query.mockImplementationOnce((sql, parametros, callback) => callback(null, [{
            id_movimentacao: 18, nome_produto: 'Tela', sku_produto: '00123', tipo_movimentacao: 'ENTRADA',
            quantidade: 3, data_movimentacao: data, nome_responsavel: 'Operador', justificativa: null
        }]));

        const resposta = await solicitar(admin, '?data_inicio=2026-09-01&data_fim=2026-09-30');
        expect(resposta.status).toBe(200);
        expect(resposta.headers.get('content-type')).toBe('application/pdf');
        expect(resposta.headers.get('content-disposition')).toBe('attachment; filename="relatorio-movimentacoes.pdf"');
        expect(resposta.headers.get('cache-control')).toBe('no-store');
        expect(await resposta.text()).toBe(conteudo);
        expect(connection.query).toHaveBeenCalledWith(expect.stringContaining('m.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)'),
            ['2026-09-01 00:00:00', '2026-09-30'], expect.any(Function));
        expect(gerarRelatorioPdf).toHaveBeenCalledTimes(1);
        expect(gerarRelatorioPdf.mock.calls[0][0].colunas.map(({ titulo }) => titulo)).toEqual([
            'Código', 'Produto', 'SKU', 'Tipo de movimentação', 'Quantidade', 'Data', 'Responsável', 'Justificativa'
        ]);
        expect(gerarRelatorioPdf.mock.calls[0][0].linhas).toEqual([[18, 'Tela', '00123', 'ENTRADA', 3, data, 'Operador', null]]);
        await limpeza;
        expect(limpar).toHaveBeenCalledTimes(1);
        await expect(fs.stat(caminhoArquivo)).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
        await fs.rm(caminhoArquivo, { force: true });
        await fs.rmdir(diretorio);
    }
});
