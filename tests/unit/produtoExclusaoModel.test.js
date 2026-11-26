
jest.mock('../../src/config/database', () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

const connection = require('../../src/config/database');

const {
    buscarPorId,
    verificarSaldo,
    verificarMovimentacoes,
    excluir,
    excluirComVerificacao
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

    // Exclusão segura com transação
    const configurarTransacao = ({
        produtos = [{ id_produto: 1, quantidade_estoque: 0 }],
        movimentacoes = [],
        affectedRows = 1
    } = {}) => {
        connection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });

        connection.commit.mockImplementation((callback) => {
            callback(null);
        });

        connection.rollback.mockImplementation((callback) => {
            callback(null);
        });

        connection.query.mockImplementation((sql, valores, callback) => {
            if (sql.includes('SELECT id_produto')) {
                return callback(null, produtos);
            }

            if (sql.includes('SELECT id_movimentacao')) {
                return callback(null, movimentacoes);
            }

            if (sql.includes('DELETE FROM produto')) {
                return callback(null, { affectedRows });
            }

            callback(new Error('Consulta inesperada no teste.'));
        });
    };

    test('deve rejeitar um ID inválido sem iniciar transação', async () => {
        await expect(excluirComVerificacao(0)).rejects.toMatchObject({
            code: 'PRODUCT_ID_INVALID'
        });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve retornar erro quando o produto não existir', async () => {
        configurarTransacao({ produtos: [] });

        await expect(excluirComVerificacao(99)).rejects.toMatchObject({
            code: 'PRODUCT_NOT_FOUND'
        });

        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.commit).not.toHaveBeenCalled();
    });

    test.each([5, -3])(
        'deve impedir a exclusão quando o saldo for %i',
        async (saldo) => {
            configurarTransacao({
                produtos: [{
                    id_produto: 1,
                    quantidade_estoque: saldo
                }]
            });

            await expect(excluirComVerificacao(1)).rejects.toMatchObject({
                code: 'PRODUCT_HAS_STOCK'
            });

            expect(connection.rollback).toHaveBeenCalled();
            expect(connection.commit).not.toHaveBeenCalled();
        }
    );

    test('deve impedir a exclusão quando houver movimentações', async () => {
        configurarTransacao({
            movimentacoes: [{ id_movimentacao: 10 }]
        });

        await expect(excluirComVerificacao(1)).rejects.toMatchObject({
            code: 'PRODUCT_HAS_MOVEMENTS'
        });

        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.commit).not.toHaveBeenCalled();
    });

    test('deve impedir a exclusão quando o DELETE não afetar uma linha', async () => {
        configurarTransacao({ affectedRows: 0 });

        await expect(excluirComVerificacao(1)).rejects.toMatchObject({
            code: 'PRODUCT_DELETE_NOT_CONFIRMED'
        });

        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.commit).not.toHaveBeenCalled();
    });

    test('deve excluir o produto e confirmar a transação com sucesso', async () => {
        configurarTransacao();

        const resultado = await excluirComVerificacao(1);

        expect(resultado).toBe(true);
        expect(connection.beginTransaction).toHaveBeenCalled();
        expect(connection.commit).toHaveBeenCalled();
        expect(connection.rollback).not.toHaveBeenCalled();

        expect(connection.query).toHaveBeenCalledWith(
            expect.stringContaining('FOR UPDATE'),
            [1],
            expect.any(Function)
        );
    });

    test('deve realizar rollback quando ocorrer erro em uma consulta', async () => {
        const erroBanco = new Error('Erro na consulta');

        connection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });

        connection.rollback.mockImplementation((callback) => {
            callback(null);
        });

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        await expect(excluirComVerificacao(1)).rejects.toBe(erroBanco);

        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.commit).not.toHaveBeenCalled();
    });
});