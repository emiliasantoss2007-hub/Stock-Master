jest.mock('../../src/models/produtoModel', () => ({
    cadastrarProduto: jest.fn()
}));

const express = require('express');
const produtoModel = require('../../src/models/produtoModel');
const produtoRoutes = require('../../src/routes/produtoRoutes');
const sessaoService = require('../../src/services/sessaoService');

describe('POST /api/produtos com sessão cookie', () => {
    let server;
    let endpoint;
    let origemAnterior;

    beforeAll(async () => {
        const app = express();
        app.use(express.json());
        app.use('/api', produtoRoutes);
        server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
        });
        endpoint = `http://127.0.0.1:${server.address().port}/api/produtos`;
        origemAnterior = process.env.APP_ORIGIN;
        process.env.APP_ORIGIN = `http://127.0.0.1:${server.address().port}`;
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            server.close((erro) => erro ? reject(erro) : resolve());
        });
        if (origemAnterior === undefined) delete process.env.APP_ORIGIN;
        else process.env.APP_ORIGIN = origemAnterior;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        produtoModel.cadastrarProduto.mockImplementation((dados, callback) => {
            callback(null, { insertId: 31 });
        });
    });

    async function cadastrar({ usuario, cookie, authorization, origin, xUser } = {}) {
        const token = usuario ? sessaoService.criar(usuario) : null;
        const headers = {
            'Content-Type': 'application/json',
            Origin: origin || `http://127.0.0.1:${server.address().port}`
        };

        if (token) headers.Cookie = `stockmaster_session=${token}`;
        if (cookie) headers.Cookie = cookie;
        if (authorization) headers.Authorization = authorization;
        if (xUser) headers['X-User'] = xUser;

        return fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                nomeProduto: 'Fonte',
                sku: 'SKU-031',
                categoria: 'Componentes',
                valorUnitario: 10,
                quantidadeInicial: 5,
                estoqueMinimo: 2
            })
        });
    }

    test.each([
        [{ id_nivel_acesso: 1, perfil: { id: 1, descricao: 'Administrador' } }],
        [{ id_nivel_acesso: 2, perfil: { id: 2, descricao: 'Técnico' } }]
    ])('permite cadastro autenticado por cookie para perfil autorizado %o', async (usuario) => {
        const resposta = await cadastrar({ usuario });

        expect(resposta.status).toBe(201);
        expect(produtoModel.cadastrarProduto).toHaveBeenCalledWith(
            expect.objectContaining({ quantidade_estoque: 5, estoque_minimo: 2 }),
            expect.any(Function)
        );
    });

    test('retorna 401 sem sessão e ignora perfil forjado em X-User', async () => {
        const resposta = await cadastrar({
            cookie: 'other=value',
            xUser: JSON.stringify({ perfil: 'Administrador', id_nivel_acesso: 1 }),
            origin: `http://127.0.0.1:${server.address().port}`
        });

        expect(resposta.status).toBe(401);
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test('retorna 401 para cookie de sessão inválido', async () => {
        const resposta = await cadastrar({ cookie: 'stockmaster_session=invalid' });

        expect(resposta.status).toBe(401);
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test('retorna 403 para sessão válida sem perfil autorizado', async () => {
        const resposta = await cadastrar({
            usuario: { id_usuario: 9, id_nivel_acesso: 3, perfil: { id: 3, descricao: 'Visitante' } }
        });

        expect(resposta.status).toBe(403);
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test('rejeita origem não permitida para autenticação por cookie', async () => {
        const resposta = await cadastrar({
            usuario: { id_usuario: 2, id_nivel_acesso: 2, perfil: { id: 2, descricao: 'Técnico' } },
            origin: 'https://attacker.example'
        });

        expect(resposta.status).toBe(403);
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test('mantém HTTP 409 para SKU duplicado com sessão cookie', async () => {
        produtoModel.cadastrarProduto.mockImplementation((dados, callback) => {
            callback(Object.assign(new Error('SKU duplicado'), { code: 'SKU_DUPLICADO' }));
        });

        const resposta = await cadastrar({
            usuario: { id_usuario: 1, id_nivel_acesso: 1, perfil: { id: 1, descricao: 'Administrador' } }
        });

        expect(resposta.status).toBe(409);
    });

    test('mantém clientes Bearer existentes compatíveis', async () => {
        const token = sessaoService.criar({
            id_usuario: 5,
            id_nivel_acesso: 2,
            perfil: { id: 2, descricao: 'Técnico' }
        });
        const resposta = await cadastrar({
            authorization: `Bearer ${token}`,
            origin: 'https://legacy-client.example'
        });

        expect(resposta.status).toBe(201);
        expect(produtoModel.cadastrarProduto).toHaveBeenCalledTimes(1);
    });
});