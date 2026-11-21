
jest.mock('../../src/config/database', () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

const connection = require('../../src/config/database');
const produtoModel = require('../../src/models/produtoModel');

describe('RF-15 - Model de Expurgo de Estoque', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        connection.beginTransaction.mockImplementation((callback) => {
            callback(null);
        });

        connection.commit.mockImplementation((callback) => {
            callback(null);
        });

        connection.rollback.mockImplementation((callback) => {
            callback(null);
        });
    });

    test('deve reduzir o estoque e registrar movimentação EXPURGO', async () => {
        connection.query
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, [{
                    id_produto: 1,
                    sku: 'SKU-001',
                    nome: 'Display LCD',
                    quantidade_estoque: 10
                }]);
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { affectedRows: 1 });
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { insertId: 20 });
            });

        const resultado = await produtoModel.registrarExpurgo(
            1, 3, 'Produto danificado', 5
        );

        expect(connection.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('UPDATE produto'),
            [7, 1],
            expect.any(Function)
        );

        expect(connection.query).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining('INSERT INTO movimentacao'),
            ['EXPURGO', 3, 'Produto danificado', 1, 5],
            expect.any(Function)
        );

        expect(resultado).toMatchObject({
            idMovimentacao: 20,
            idProduto: 1,
            quantidade: 3,
            saldoAnterior: 10,
            saldoNovo: 7,
            justificativa: 'Produto danificado'
        });

        expect(connection.commit).toHaveBeenCalled();
        expect(connection.rollback).not.toHaveBeenCalled();
    });

    test('deve rejeitar quantidade maior que o saldo disponível', async () => {
        connection.query.mockImplementationOnce((sql, valores, callback) => {
            callback(null, [{
                id_produto: 1,
                sku: 'SKU-001',
                nome: 'Display LCD',
                quantidade_estoque: 2
            }]);
        });

        await expect(
            produtoModel.registrarExpurgo(1, 5, 'Produto danificado', 5)
        ).rejects.toMatchObject({
            code: 'INSUFFICIENT_STOCK'
        });

        expect(connection.commit).not.toHaveBeenCalled();
        expect(connection.rollback).toHaveBeenCalled();
    });

    test('deve rejeitar produto inexistente', async () => {
        connection.query.mockImplementationOnce((sql, valores, callback) => {
            callback(null, []);
        });

        await expect(
            produtoModel.registrarExpurgo(99, 1, 'Justificativa', 5)
        ).rejects.toMatchObject({
            code: 'PRODUCT_NOT_FOUND'
        });

        expect(connection.rollback).toHaveBeenCalled();
    });

    test('deve rejeitar quantidade inválida', async () => {
        await expect(
            produtoModel.registrarExpurgo(1, 0, 'Justificativa', 5)
        ).rejects.toMatchObject({
            code: 'QUANTITY_INVALID'
        });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve exigir justificativa', async () => {
        await expect(
            produtoModel.registrarExpurgo(1, 2, '   ', 5)
        ).rejects.toMatchObject({
            code: 'JUSTIFICATION_REQUIRED'
        });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve rejeitar identificador de produto inválido', async () => {
        await expect(
            produtoModel.registrarExpurgo(0, 2, 'Justificativa', 5)
        ).rejects.toMatchObject({
            code: 'PRODUCT_ID_INVALID'
        });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve realizar rollback quando ocorrer erro ao registrar movimentação', async () => {
        const erroBanco = new Error('Erro ao inserir movimentação');

        connection.query
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, [{
                    id_produto: 1,
                    sku: 'SKU-001',
                    nome: 'Display LCD',
                    quantidade_estoque: 10
                }]);
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { affectedRows: 1 });
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(erroBanco);
            });

        await expect(
            produtoModel.registrarExpurgo(1, 3, 'Produto danificado', 5)
        ).rejects.toBe(erroBanco);

        expect(connection.rollback).toHaveBeenCalled();
        expect(connection.commit).not.toHaveBeenCalled();
    });
});
