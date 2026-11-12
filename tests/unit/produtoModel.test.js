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
            estoque_minimo: 3,
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

    test.each([
        [{ sku: 'SKU-001', categoria: 'Componentes' }],
        [{ sku: 'SKU-001', nome: 'Fonte' }],
        [{ nome: 'Fonte', categoria: 'Componentes' }]
    ])('deve exigir nome, categoria e SKU: %o', (dados) => {
        const callback = jest.fn();

        cadastrarProduto(dados, callback);

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Nome, categoria e SKU são obrigatórios' })
        );
        expect(connection.query).not.toHaveBeenCalled();
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
            estoque_minimo: 3,
            valor: 150.00
        }, callback);

        expect(connection.query).toHaveBeenCalledTimes(2);
        expect(connection.query.mock.calls[1][0]).toContain('estoque_minimo');
        expect(connection.query.mock.calls[1][1]).toEqual([
            'SKU-001', '789000000001', 'Fonte de Alimentação', 'Componentes',
            'Produto em teste', 10, 3, 150
        ]);
        expect(callback).toHaveBeenCalledWith(null, { insertId: 5 });
    });

    test('deve preservar o erro original do banco para o Controller', () => {
        const erroBanco = Object.assign(new Error('Duplicate entry'), {
            code: 'ER_DUP_ENTRY',
            errno: 1062
        });

        connection.query
            .mockImplementationOnce((sql, valores, callback) => callback(null, []))
            .mockImplementationOnce((sql, valores, callback) => callback(erroBanco));

        const callback = jest.fn();

        cadastrarProduto({ sku: 'SKU-001', nome: 'Fonte', categoria: 'Componentes' }, callback);

        expect(callback).toHaveBeenCalledWith(erroBanco);
        expect(erroBanco.code).toBe('ER_DUP_ENTRY');
    });

    test('deve marcar a duplicidade detectada na verificação prévia', () => {
        connection.query.mockImplementation((sql, valores, callback) => callback(null, [{ id_produto: 1 }]));

        const callback = jest.fn();

        cadastrarProduto({ sku: 'SKU-001', nome: 'Fonte', categoria: 'Componentes' }, callback);

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'SKU_DUPLICADO', message: 'SKU já cadastrado' })
        );
    });
});
