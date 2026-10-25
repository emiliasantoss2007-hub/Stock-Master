// Simula o Model para testar apenas o Controller
jest.mock(
    '../../src/models/produtoModel',
    () => ({
        cadastrarProduto: jest.fn()
    }),
    { virtual: true }
);

const produtoModel = require('../../src/models/produtoModel');

const {
    cadastrarProduto
} = require('../../src/controllers/produtoController');

// Dados válidos para reutilizar nos testes
const dadosValidos = {
    nomeProduto: 'Display LCD',
    sku: 'SKU-004',
    categoria: 'Telas',
    valorUnitario: 125.50,
    quantidadeInicial: 10,
    estoqueMinimo: 3,
    descricao: 'Display para celular'
};

// Simula uma requisição HTTP
const criarReq = (body) => ({
    body
});

// Simula uma resposta HTTP
const criarRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('RF08 - Cadastrar Produto (Controller)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve retornar erro quando o nome não for informado', () => {

        const req = criarReq({
            ...dadosValidos,
            nomeProduto: ''
        });

        const res = criarRes();

        cadastrarProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Nome do produto é obrigatório.'
        });

        expect(produtoModel.cadastrarProduto)
            .not.toHaveBeenCalled();
    });

    test('deve retornar erro quando o SKU não for informado', () => {

        const req = criarReq({
            ...dadosValidos,
            sku: ''
        });

        const res = criarRes();

        cadastrarProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: 'SKU é obrigatório.'
        });

        expect(produtoModel.cadastrarProduto)
            .not.toHaveBeenCalled();
    });

    test('deve retornar erro quando a quantidade for inválida', () => {

        const req = criarReq({
            ...dadosValidos,
            quantidadeInicial: 0
        });

        const res = criarRes();

        cadastrarProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message:
                'Informe uma quantidade inicial inteira maior que zero.'
        });

        expect(produtoModel.cadastrarProduto)
            .not.toHaveBeenCalled();
    });

    test('deve cadastrar produto quando os dados forem válidos', () => {

        produtoModel.cadastrarProduto.mockImplementation(
            (dados, callback) => {
                callback(null, {
                    insertId: 1
                });
            }
        );

        const req = criarReq(dadosValidos);
        const res = criarRes();

        cadastrarProduto(req, res);

        expect(produtoModel.cadastrarProduto).toHaveBeenCalledWith(
            {
                nome: 'Display LCD',
                sku: 'SKU-004',
                categoria: 'Telas',
                valor: 125.50,
                quantidade_estoque: 10,
                estoque_minimo: 3,
                descricao: 'Display para celular',
                codigo_barras: null
            },
            expect.any(Function)
        );

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Produto cadastrado com sucesso.',
            id_produto: 1
        });
    });

    test('deve retornar erro quando o SKU já estiver cadastrado', () => {

        produtoModel.cadastrarProduto.mockImplementation(
            (dados, callback) => {
                const erro = new Error('SKU duplicado');
                erro.code = 'ER_DUP_ENTRY';

                callback(erro);
            }
        );

        const req = criarReq(dadosValidos);
        const res = criarRes();

        cadastrarProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: 'SKU já cadastrado.'
        });
    });

    test('deve retornar erro interno quando o cadastro falhar', () => {

        produtoModel.cadastrarProduto.mockImplementation(
            (dados, callback) => {
                callback(new Error('Falha no banco'));
            }
        );

        const req = criarReq(dadosValidos);
        const res = criarRes();

        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        cadastrarProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro interno ao cadastrar produto.'
        });

        consoleSpy.mockRestore();
    });

});