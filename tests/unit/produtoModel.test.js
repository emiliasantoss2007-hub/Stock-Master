
jest.mock("../../src/config/database", () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

const connection = require("../../src/config/database");
const {
    registrarEntrada
} = require("../../src/models/produtoModel");

describe("RF-12 — Registro de entrada de produtos", () => {
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

    test("registra entrada e atualiza a quantidade em estoque", async () => {
        connection.query
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, [{
                    id_produto: 7,
                    sku: "SKU001",
                    nome: "Produto Teste",
                    quantidade_estoque: 10
                }]);
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { affectedRows: 1 });
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { insertId: 25 });
            });

        const resultado = await registrarEntrada(7, 5, 3);

        expect(resultado).toEqual({
            idMovimentacao: 25,
            idProduto: 7,
            sku: "SKU001",
            nome: "Produto Teste",
            quantidade: 5,
            saldoAnterior: 10,
            saldoNovo: 15,
            idUsuario: 3
        });

        expect(connection.query).toHaveBeenCalledTimes(3);

        expect(connection.query.mock.calls[1][0])
            .toContain("UPDATE produto");

        expect(connection.query.mock.calls[1][1])
            .toEqual([15, 7]);

        expect(connection.query.mock.calls[2][0])
            .toContain("INSERT INTO movimentacao");

        expect(connection.query.mock.calls[2][1])
            .toEqual(["ENTRADA", 5, null, 7, 3]);

        expect(connection.commit).toHaveBeenCalledTimes(1);
        expect(connection.rollback).not.toHaveBeenCalled();
    });

    test("rejeita quantidade inválida", async () => {
        await expect(
            registrarEntrada(7, 0, 3)
        ).rejects.toMatchObject({
            code: "QUANTITY_INVALID"
        });

        expect(connection.beginTransaction)
            .not.toHaveBeenCalled();
    });

    test("rejeita identificador de produto inválido", async () => {
        await expect(
            registrarEntrada("abc", 5, 3)
        ).rejects.toMatchObject({
            code: "PRODUCT_ID_INVALID"
        });

        expect(connection.beginTransaction)
            .not.toHaveBeenCalled();
    });

    test("não registra entrada para produto inexistente", async () => {
        connection.query.mockImplementationOnce(
            (sql, params, callback) => callback(null, [])
        );

        await expect(
            registrarEntrada(99, 5, 3)
        ).rejects.toMatchObject({
            code: "PRODUCT_NOT_FOUND"
        });

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
        expect(connection.query).toHaveBeenCalledTimes(1);
    });

    test("desfaz a transação quando o registro da movimentação falha", async () => {
        const erroBanco = new Error("Falha ao registrar movimentação");

        connection.query
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, [{
                    id_produto: 7,
                    sku: "SKU001",
                    nome: "Produto Teste",
                    quantidade_estoque: 10
                }]);
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { affectedRows: 1 });
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(erroBanco);
            });

        await expect(
            registrarEntrada(7, 5, 3)
        ).rejects.toBe(erroBanco);

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
    });
});
