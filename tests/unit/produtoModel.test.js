jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');
const { cadastrarProduto, verificarSKU } = require('../../src/models/produtoModel');

describe('RF-08 - Model de Cadastro de Produto', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve retornar erro quando o SKU já estiver cadastrado', () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, [{ id_produto: 1 }]);
        });

        const callback = jest.fn();

        cadastrarProduto({
            sku: 'SKU-001',
            codigo_barras: '789000000001',
            nome: 'Fonte de Alimentação',
            categoria: 'Componentes',
            descricao: 'Produto em teste',
            quantidade_estoque: 10,
            valor: 150.00
        }, callback);

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'SKU já cadastrado' })
        );
    });

    test('deve retornar erro quando campos obrigatórios estiverem vazios', () => {
        const callback = jest.fn();

        cadastrarProduto({
            sku: '',
            nome: '',
            categoria: '',
            quantidade_estoque: 0,
            valor: 0
        }, callback);

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Nome, categoria e SKU são obrigatórios' })
        );
    });

    test('deve verificar se o SKU já existe', () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, [{ id_produto: 1 }]);
        });

        const callback = jest.fn();

        verificarSKU('SKU-001', callback);

        expect(callback).toHaveBeenCalledWith(null, true);
    });

    test('deve cadastrar o produto quando os dados forem válidos', () => {
        connection.query
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, []);
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { insertId: 5 });
            });

        const callback = jest.fn();

        cadastrarProduto({
            sku: 'SKU-001',
            codigo_barras: '789000000001',
            nome: 'Fonte de Alimentação',
            categoria: 'Componentes',
            descricao: 'Produto em teste',
            quantidade_estoque: 10,
            valor: 150.00
        }, callback);

        expect(connection.query).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(null, { insertId: 5 });
    });
});
