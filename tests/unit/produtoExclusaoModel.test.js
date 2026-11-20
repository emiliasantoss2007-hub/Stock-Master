
jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');

const {
    buscarPorId,
    verificarSaldo,
    verificarMovimentacoes,
    excluir
} = require('../../src/models/produtoModel');

describe('RF-10 - Model de Exclusão de Produto', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Buscar produto pelo ID
    test('deve retornar o produto quando ele existir', async () => {
        const produto = {
            id_produto: 1,
            sku: 'SKU-001',
            nome: 'Display LCD',
            categoria: 'Telas',
            quantidade_estoque: 0,
            valor: 125.50
        };

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, [produto]);
        });

        const resultado = await buscarPorId(1);

        expect(connection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [1],
            expect.any(Function)
        );
        expect(resultado).toEqual(produto);
    });

    test('deve retornar null quando o produto não existir', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        const resultado = await buscarPorId(99);

        expect(resultado).toBeNull();
    });

    test('deve preservar o erro do banco ao buscar produto', async () => {
        const erroBanco = new Error('Erro na consulta');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        await expect(buscarPorId(1)).rejects.toBe(erroBanco);
    });

    // Verificar saldo em estoque
    test('deve retornar a quantidade em estoque do produto', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, [{ quantidade_estoque: 5 }]);
        });

        const resultado = await verificarSaldo(1);

        expect(connection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [1],
            expect.any(Function)
        );
        expect(resultado).toBe(5);
    });

    test('deve retornar null quando não encontrar o produto ao verificar saldo', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        const resultado = await verificarSaldo(99);

        expect(resultado).toBeNull();
    });

    test('deve preservar o erro do banco ao verificar saldo', async () => {
        const erroBanco = new Error('Erro na consulta de saldo');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        await expect(verificarSaldo(1)).rejects.toBe(erroBanco);
    });

    // Verificar movimentações registradas
    test('deve retornar a quantidade de movimentações do produto', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, [{ total: 3 }]);
        });

        const resultado = await verificarMovimentacoes(1);

        expect(connection.query).toHaveBeenCalledWith(
            expect.stringContaining('COUNT(*)'),
            [1],
            expect.any(Function)
        );
        expect(resultado).toBe(3);
    });

    test('deve preservar o erro do banco ao verificar movimentações', async () => {
        const erroBanco = new Error('Erro na consulta de movimentações');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        await expect(verificarMovimentacoes(1)).rejects.toBe(erroBanco);
    });

    // Excluir produto
    test('deve retornar true quando o produto for excluído', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const resultado = await excluir(1);

        expect(connection.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM produto'),
            [1],
            expect.any(Function)
        );
        expect(resultado).toBe(true);
    });

    test('deve retornar false quando nenhum produto for excluído', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, { affectedRows: 0 });
        });

        const resultado = await excluir(99);

        expect(resultado).toBe(false);
    });

    test('deve preservar o erro do banco ao excluir produto', async () => {
        const erroBanco = new Error('Erro ao excluir produto');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        await expect(excluir(1)).rejects.toBe(erroBanco);
    });
});
