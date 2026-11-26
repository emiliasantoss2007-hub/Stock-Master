
jest.mock('../../src/models/produtoModel', () => ({
    listarParaEntrada: jest.fn(),
    registrarEntrada: jest.fn()
}));

const express = require('express');
const produtoModel = require('../../src/models/produtoModel');
const produtoRoutes = require('../../src/routes/produtoRoutes');
const sessaoService = require('../../src/services/sessaoService');

describe('RF-12 - Rotas de Entrada de Estoque', () => {
    let server;
    let endpoint;

    beforeAll(async () => {
        const app = express();
        app.use(express.json());
        app.use('/api', produtoRoutes);

        server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
        });

        endpoint = `http://127.0.0.1:${server.address().port}/api/produtos/entrada`;
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            server.close((erro) => erro ? reject(erro) : resolve());
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();

        produtoModel.listarParaEntrada.mockResolvedValue([]);

        produtoModel.registrarEntrada.mockResolvedValue({
            id_movimentacao: 1,
            id_produto: 10,
            quantidade: 5
        });
    });

    async function requisitar({ usuario, metodo = 'GET', tokenInvalido = false } = {}) {
        const token = usuario ? sessaoService.criar(usuario) : null;

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (tokenInvalido) {
            headers.Authorization = 'Bearer token-invalido';
        }

        return fetch(
            metodo === 'GET' ? `${endpoint}/listar` : endpoint,
            {
                method: metodo,
                headers,
                body: metodo === 'POST'
                    ? JSON.stringify({ id_produto: 10, quantidade: 5 })
                    : undefined
            }
        );
    }

    const administrador = {
        id_usuario: 1,
        id_nivel_acesso: 1,
        perfil: { id: 1, descricao: 'Administrador' }
    };

    const tecnico = {
        id_usuario: 2,
        id_nivel_acesso: 2,
        perfil: { id: 2, descricao: 'Técnico' }
    };

    const visitante = {
        id_usuario: 3,
        id_nivel_acesso: 3,
        perfil: { id: 3, descricao: 'Visitante' }
    };

    test('permite listar produtos para Administrador', async () => {
        const resposta = await requisitar({ usuario: administrador });

        expect(resposta.status).toBe(200);
        expect(produtoModel.listarParaEntrada).toHaveBeenCalled();
    });

    test('permite listar produtos para Técnico', async () => {
        const resposta = await requisitar({ usuario: tecnico });

        expect(resposta.status).toBe(200);
        expect(produtoModel.listarParaEntrada).toHaveBeenCalled();
    });

    test('permite registrar entrada para Administrador', async () => {
        const resposta = await requisitar({
            usuario: administrador,
            metodo: 'POST'
        });

        expect(resposta.status).toBe(201);
        expect(produtoModel.registrarEntrada).toHaveBeenCalledWith(10, 5, 1);
    });

    test('permite registrar entrada para Técnico', async () => {
        const resposta = await requisitar({
            usuario: tecnico,
            metodo: 'POST'
        });

        expect(resposta.status).toBe(201);
        expect(produtoModel.registrarEntrada).toHaveBeenCalledWith(10, 5, 2);
    });

    test('retorna 403 ao listar produtos para perfil não autorizado', async () => {
        const resposta = await requisitar({ usuario: visitante });

        expect(resposta.status).toBe(403);
        expect(produtoModel.listarParaEntrada).not.toHaveBeenCalled();
    });

    test('retorna 403 ao registrar entrada para perfil não autorizado', async () => {
        const resposta = await requisitar({
            usuario: visitante,
            metodo: 'POST'
        });

        expect(resposta.status).toBe(403);
        expect(produtoModel.registrarEntrada).not.toHaveBeenCalled();
    });

    test('retorna 401 ao listar produtos sem autenticação', async () => {
        const resposta = await requisitar();

        expect(resposta.status).toBe(401);
        expect(produtoModel.listarParaEntrada).not.toHaveBeenCalled();
    });

    test('retorna 401 ao registrar entrada sem autenticação', async () => {
        const resposta = await requisitar({ metodo: 'POST' });

        expect(resposta.status).toBe(401);
        expect(produtoModel.registrarEntrada).not.toHaveBeenCalled();
    });

    test('retorna 401 para token inválido', async () => {
        const resposta = await requisitar({ tokenInvalido: true });

        expect(resposta.status).toBe(401);
        expect(produtoModel.listarParaEntrada).not.toHaveBeenCalled();
    });
});
