
jest.mock("../../src/config/database", () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

const connection = require("../../src/config/database");
const {
    excluirComVerificacao
} = require("../../src/models/produtoModel");

describe("Model de exclusão de produtos", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        connection.beginTransaction.mockImplementation(
            (callback) => callback(null)
        );

        connection.commit.mockImplementation(
            (callback) => callback(null)
        );

        connection.rollback.mockImplementation(
            (callback) => callback(null)
        );
    });

    test("rejeita identificador inválido", async () => {
        await expect(
            excluirComVerificacao("abc")
        ).rejects.toMatchObject({
            statusCode: 400,
            code: "PRODUCT_ID_INVALID"
        });

        expect(
            connection.beginTransaction
        ).not.toHaveBeenCalled();
    });

    test("não exclui produto inexistente", async () => {
        connection.query.mockImplementation(
            (sql, params, callback) => callback(null, [])
        );

        await expect(
            excluirComVerificacao(42)
        ).rejects.toMatchObject({
            statusCode: 404,
            code: "PRODUCT_NOT_FOUND"
        });

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });

    test("bloqueia produto com saldo em estoque", async () => {
        connection.query.mockImplementation(
            (sql, params, callback) =>
                callback(null, [{
                    id_produto: 7,
                    quantidade_estoque: 3
                }])
        );

        await expect(
            excluirComVerificacao(7)
        ).rejects.toMatchObject({
            statusCode: 409,
            code: "PRODUCT_HAS_STOCK"
        });

        expect(connection.query).toHaveBeenCalledTimes(1);
        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });

    test("bloqueia produto com movimentações e saldo zero", async () => {
        connection.query
            .mockImplementationOnce(
                (sql, params, callback) =>
                    callback(null, [{
                        id_produto: 7,
                        quantidade_estoque: 0
                    }])
            )
            .mockImplementationOnce(
                (sql, params, callback) =>
                    callback(null, [{
                        id_movimentacao: 19
                    }])
            );

        await expect(
            excluirComVerificacao(7)
        ).rejects.toMatchObject({
            statusCode: 409,
            code: "PRODUCT_HAS_MOVEMENTS"
        });

        expect(connection.query).toHaveBeenCalledTimes(2);
        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });

    test("exclui produto sem saldo e sem movimentações", async () => {
        connection.query
            .mockImplementationOnce(
                (sql, params, callback) =>
                    callback(null, [{
                        id_produto: 7,
                        quantidade_estoque: 0
                    }])
            )
            .mockImplementationOnce(
                (sql, params, callback) =>
                    callback(null, [])
            )
            .mockImplementationOnce(
                (sql, params, callback) =>
                    callback(null, { affectedRows: 1 })
            );

        await expect(
            excluirComVerificacao("7")
        ).resolves.toEqual({
            id_produto: 7,
            excluido: true
        });

        expect(connection.query).toHaveBeenCalledTimes(3);
        expect(connection.commit).toHaveBeenCalledTimes(1);
        expect(connection.rollback).not.toHaveBeenCalled();
    });

    test("desfaz a transação quando o banco retorna erro", async () => {
        const erroBanco = new Error("Falha de banco");

        connection.query.mockImplementation(
            (sql, params, callback) => callback(erroBanco)
        );

        await expect(
            excluirComVerificacao(7)
        ).rejects.toBe(erroBanco);

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });
});
