jest.mock('../../src/controllers/produtoController', () => ({
    consultarProdutos: jest.fn(),
    cadastrarProduto: jest.fn(),
    excluirProduto: jest.fn(),
    listarParaEntrada: jest.fn(),
    registrarEntrada: jest.fn(),
    listarParaExpurgo: jest.fn((req, res) =>
        res.status(200).json({ sucesso: true })
    ),
    registrarExpurgo: jest.fn((req, res) =>
        res.status(201).json({ sucesso: true })
    )
}));

jest.mock('../../src/middlewares/auth', () =>
    jest.fn((req, res, next) => {
        req.usuario = { id_usuario: 5, id_nivel_acesso: 1 };
        next();
    })
);

jest.mock('../../src/middlewares/produtoAuth', () => jest.fn((req, res, next) => next()));
jest.mock('../../src/middlewares/produtoCsrf', () => jest.fn((req, res, next) => next()));
jest.mock('../../src/middlewares/produtoAccess', () => jest.fn((req, res, next) => next()));

const express = require('express');
const request = require('supertest');

const produtoRoutes = require('../../src/routes/produtoRoutes');
const produtoController = require('../../src/controllers/produtoController');
const auth = require('../../src/middlewares/auth');

describe('RF-15 - Rotas de Expurgo de Estoque', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();

        app = express();
        app.use(express.json());
        app.use('/api', produtoRoutes);
    });

    test('GET deve listar produtos disponíveis para expurgo', async () => {
        const resposta = await request(app)
            .get('/api/produtos/expurgo/listar');

        expect(resposta.status).toBe(200);
        expect(produtoController.listarParaExpurgo).toHaveBeenCalled();
        expect(auth).toHaveBeenCalled();
    });

    test('POST deve encaminhar o registro de expurgo ao Controller', async () => {
        const dados = {
            id_produto: 1,
            quantidade: 3,
            justificativa: 'Produto danificado'
        };

        const resposta = await request(app)
            .post('/api/produtos/expurgo')
            .send(dados);

        expect(resposta.status).toBe(201);
        expect(produtoController.registrarExpurgo).toHaveBeenCalled();
        expect(auth).toHaveBeenCalled();
    });
});
