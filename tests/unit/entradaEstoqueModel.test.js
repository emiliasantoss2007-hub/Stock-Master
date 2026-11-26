
jest.mock('../../src/config/database', () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

const connection = require('../../src/config/database');
const {
    listarParaEntrada,
    registrarEntrada
} = require('../../src/models/produtoModel');

describe('RF-12 - Model de Entrada de Estoque', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve listar os produtos disponíveis para entrada', async () => {
        const produtos = [
            {
                id_produto: 1,
                sku: 'SKU-001',
                nome: 'Tela',
                quantidade_estoque: 10
            }
        ];

        connection.query.mockImplementation((sql, callback) => {
            callback(null, produtos);
        });

        await expect(listarParaEntrada()).resolves.toEqual(produtos);
    });

    test('deve registrar entrada e atualizar o saldo do produto', async () => {
        connection.beginTransaction.mockImplementation(callback => callback(null));

        connection.query
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, [{
                    id_produto: 7,
                    sku: 'SKU-007',
                    nome: 'Tela',
                    quantidade_estoque: 10
                }]);
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { affectedRows: 1 });
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { insertId: 15 });
            });

        connection.commit.mockImplementation(callback => callback(null));
        connection.rollback.mockImplementation(callback => callback(null));

        const resultado = await registrarEntrada(7, 5, 3);

        expect(resultado.saldoAnterior).toBe(10);
        expect(resultado.saldoNovo).toBe(15);
        expect(resultado.quantidade).toBe(5);
        expect(connection.commit).toHaveBeenCalledTimes(1);
        expect(connection.rollback).not.toHaveBeenCalled();
    });

    test('deve rejeitar quantidade inválida', async () => {
        await expect(registrarEntrada(7, 0, 3))
            .rejects.toMatchObject({ code: 'QUANTITY_INVALID' });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve rejeitar identificador de produto inválido', async () => {
        await expect(registrarEntrada(0, 5, 3))
            .rejects.toMatchObject({ code: 'PRODUCT_ID_INVALID' });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve rejeitar usuário inválido', async () => {
        await expect(registrarEntrada(7, 5, 0))
            .rejects.toMatchObject({ code: 'USER_ID_INVALID' });

        expect(connection.beginTransaction).not.toHaveBeenCalled();
    });

    test('deve cancelar a transação quando o produto não existir', async () => {
        connection.beginTransaction.mockImplementation(callback => callback(null));
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });
        connection.rollback.mockImplementation(callback => callback(null));

        await expect(registrarEntrada(7, 5, 3))
            .rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });

        test('deve cancelar a transação quando falhar ao registrar a movimentação', async () => {
        connection.beginTransaction.mockImplementation(callback => callback(null));

        connection.query
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, [{
                    id_produto: 7,
                    sku: 'SKU-007',
                    nome: 'Tela',
                    quantidade_estoque: 10
                }]);
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(null, { affectedRows: 1 });
            })
            .mockImplementationOnce((sql, valores, callback) => {
                callback(new Error('Falha ao inserir movimentação'));
            });

        connection.rollback.mockImplementation(callback => callback(null));

        await expect(registrarEntrada(7, 5, 3))
            .rejects.toThrow('Falha ao inserir movimentação');

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });
});
