jest.mock('../../src/models/produtoModel', () => ({
    cadastrarProduto: jest.fn()
}));

const produtoModel = require('../../src/models/produtoModel');
const { cadastrarProduto } = require('../../src/controllers/produtoController');

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('RF-08 - Controller de Cadastro de Produto', () => {
    beforeEach(() => jest.clearAllMocks());

    test.each([
        [{ categoria: 'Componentes', sku: 'SKU-001' }, 'Nome é obrigatório'],
        [{ nome: 'Fonte', sku: 'SKU-001' }, 'Categoria é obrigatória'],
        [{ nome: 'Fonte', categoria: 'Componentes' }, 'SKU é obrigatório']
    ])('rejeita dados incompletos: %o', async (body, message) => {
        const res = criarResposta();

        await cadastrarProduto({ body }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message });
        expect(produtoModel.cadastrarProduto).not.toHaveBeenCalled();
    });

    test.each(['SKU_DUPLICADO', 'ER_DUP_ENTRY', '23505'])(
        'retorna 409 para duplicidade identificada por %s', (code) => {
            produtoModel.cadastrarProduto.mockImplementation((dados, callback) => {
                callback(Object.assign(new Error('SKU já existe'), { code }));
            });
            const res = criarResposta();

            cadastrarProduto({ body: { nome: 'Fonte', categoria: 'Componentes', sku: 'SKU-001' } }, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'SKU já cadastrado.' });
        }
    );

    test('retorna erro inesperado sem classificá-lo como SKU duplicado', () => {
        const erroOriginal = Object.assign(new Error('Connection lost'), { code: 'PROTOCOL_CONNECTION_LOST' });
        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});
        produtoModel.cadastrarProduto.mockImplementation((dados, callback) => callback(erroOriginal));
        const res = criarResposta();

        cadastrarProduto({ body: { nome: 'Fonte', categoria: 'Componentes', sku: 'SKU-001' } }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro interno ao cadastrar produto.',
            code: 'PROTOCOL_CONNECTION_LOST'
        });
        expect(logErro).toHaveBeenCalledWith(
            '[StockMaster][ProdutoController] Erro ao cadastrar produto:',
            erroOriginal
        );
        logErro.mockRestore();
    });

    test('encaminha os dados e responde 201 após persistência', () => {
        const body = {
            nome: 'Fonte',
            categoria: 'Componentes',
            sku: 'SKU-001',
            estoque_minimo: 4
        };
        produtoModel.cadastrarProduto.mockImplementation((dados, callback) => {
            callback(null, { insertId: 23 });
        });
        const res = criarResposta();

        cadastrarProduto({ body }, res);

        expect(produtoModel.cadastrarProduto).toHaveBeenCalledWith(body, expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Produto cadastrado com sucesso.',
            id_produto: 23
        });
    });
});