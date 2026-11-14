jest.mock('../../src/models/produtoModel', () => ({
    cadastrarProduto: jest.fn()
}));

const produtoModel = require('../../src/models/produtoModel');
const { cadastrarProduto } = require('../../src/controllers/produtoController');

const dadosValidos = {
    nomeProduto: 'Display LCD',
    sku: 'SKU-004',
    codigoBarras: '789000000004',
    categoria: 'Telas',
    valorUnitario: 125.50,
    quantidadeInicial: 10,
    estoqueMinimo: 3,
    descricao: 'Display para celular'
};

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('RF-08 - Controller de Cadastro de Produto', () => {
    beforeEach(() => jest.clearAllMocks());

    test.each([
        ['nomeProduto', ''],
        ['sku', ' '],
        ['categoria', '']
    ])('rejeita %s ausente', (campo, valor) => {
        const res = criarResposta();

        cadastrarProduto({ body: { ...dadosValidos, [campo]: valor } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test.each([
        ['valorUnitario', -1],
        ['valorUnitario', 'abc'],
        ['quantidadeInicial', 0],
        ['quantidadeInicial', 1.5],
        ['estoqueMinimo', -1],
        ['estoqueMinimo', 1.5]
    ])('rejeita %s inválido (%s)', (campo, valor) => {
        const res = criarResposta();

        cadastrarProduto({ body: { ...dadosValidos, [campo]: valor } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test('mapeia os campos do formulário ao Model e retorna o ID gerado', () => {
        produtoModel.cadastrarProduto.mockImplementation((dados, callback) => {
            callback(null, { insertId: 23 });
        });
        const res = criarResposta();

        cadastrarProduto({ body: dadosValidos }, res);

        expect(produtoModel.cadastrarProduto).toHaveBeenCalledWith({
            nome: 'Display LCD',
            sku: 'SKU-004',
            categoria: 'Telas',
            valor: 125.50,
            quantidade_estoque: 10,
            estoque_minimo: 3,
            descricao: 'Display para celular',
            codigo_barras: '789000000004'
        }, expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Produto cadastrado com sucesso.',
            id_produto: 23
        });
    });

    test.each(['SKU_DUPLICADO', 'ER_DUP_ENTRY', '23505'])(
        'responde 409 para duplicidade identificada por %s', (code) => {
            produtoModel.cadastrarProduto.mockImplementation((dados, callback) => {
                callback(Object.assign(new Error('SKU já existe'), { code }));
            });
            const res = criarResposta();

            cadastrarProduto({ body: dadosValidos }, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'SKU já cadastrado.' });
        }
    );

    test('preserva identificação de erro inesperado sem tratá-lo como duplicidade', () => {
        const erroOriginal = Object.assign(new Error('Connection lost'), {
            code: 'PROTOCOL_CONNECTION_LOST'
        });
        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});
        produtoModel.cadastrarProduto.mockImplementation((dados, callback) => callback(erroOriginal));
        const res = criarResposta();

        cadastrarProduto({ body: dadosValidos }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro interno ao cadastrar produto.',
            code: 'PROTOCOL_CONNECTION_LOST'
        });
        expect(logErro).toHaveBeenCalledWith('Erro ao cadastrar produto:', erroOriginal);
        logErro.mockRestore();
    });
});