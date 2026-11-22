
jest.mock('../../src/models/produtoModel', () => ({
    listarParaExpurgo: jest.fn(),
    registrarExpurgo: jest.fn()
}));

const produtoModel = require('../../src/models/produtoModel');
const produtoController = require('../../src/controllers/produtoController');

describe('RF-15 - Controller de Expurgo de Estoque', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            usuario: {
                id_usuario: 5,
                id_nivel_acesso: 1
            },
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('deve listar produtos disponíveis para expurgo', async () => {
        const produtos = [
            { id_produto: 1, nome: 'Display LCD', quantidade_estoque: 10 }
        ];

        produtoModel.listarParaExpurgo.mockResolvedValue(produtos);

        await produtoController.listarParaExpurgo(req, res);

        expect(produtoModel.listarParaExpurgo).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            produtos
        });
    });

    test('deve registrar expurgo com sucesso', async () => {
        const dadosExpurgo = {
            id_produto: 1,
            quantidade: 3,
            justificativa: 'Produto danificado'
        };

        const resultado = {
            idMovimentacao: 20,
            idProduto: 1,
            quantidade: 3,
            saldoAnterior: 10,
            saldoNovo: 7
        };

        req.body = dadosExpurgo;
        produtoModel.registrarExpurgo.mockResolvedValue(resultado);

        await produtoController.registrarExpurgo(req, res);

        expect(produtoModel.registrarExpurgo).toHaveBeenCalledWith(
            1, 3, 'Produto danificado', 5
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            mensagem: expect.any(String),
            dados: resultado
        });
    });

    test('deve impedir expurgo por usuário técnico', async () => {
        req.usuario.id_nivel_acesso = 2;

        await produtoController.registrarExpurgo(req, res);

        expect(produtoModel.registrarExpurgo).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('deve retornar erro quando o produto não for encontrado', async () => {
        req.body = {
            id_produto: 99,
            quantidade: 1,
            justificativa: 'Produto danificado'
        };

        produtoModel.registrarExpurgo.mockRejectedValue({
            code: 'PRODUCT_NOT_FOUND'
        });

        await produtoController.registrarExpurgo(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deve retornar conflito quando a quantidade superar o estoque', async () => {
        req.body = {
            id_produto: 1,
            quantidade: 20,
            justificativa: 'Produto danificado'
        };

        produtoModel.registrarExpurgo.mockRejectedValue({
            code: 'INSUFFICIENT_STOCK'
        });

        await produtoController.registrarExpurgo(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    test('deve retornar erro 500 quando ocorrer falha inesperada ao listar produtos', async () => {
        produtoModel.listarParaExpurgo.mockRejectedValue(
            new Error('Falha no banco')
        );

        await produtoController.listarParaExpurgo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
