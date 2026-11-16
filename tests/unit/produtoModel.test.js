jest.mock("../../src/config/database", () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

const connection = require("../../src/config/database");
const {
    registrarEntrada,
    cadastrarProduto,
    verificarSKU
} = require("../../src/models/produtoModel");

describe("Testes do Model de Produtos (Stock Master)", () => {
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

    describe("RF-12 — Registro de entrada de produtos", () => {
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

    describe("RF-08 - Model de Cadastro de Produto", () => {
        test("deve retornar erro quando o SKU já estiver cadastrado", () => {
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

        test("deve retornar erro quando campos obrigatórios estiverem vazios", () => {
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
        ])("deve exigir nome, categoria e SKU: %o", (dados) => {
            const callback = jest.fn();

            cadastrarProduto(dados, callback);

            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Nome, categoria e SKU são obrigatórios' })
            );
            expect(connection.query).not.toHaveBeenCalled();
        });

        test("deve verificar se o SKU já existe", () => {
            connection.query.mockImplementation((sql, valores, callback) => {
                callback(null, [{ id_produto: 1 }]);
            });

            const callback = jest.fn();

            verificarSKU('SKU-001', callback);

            expect(callback).toHaveBeenCalledWith(null, true);
        });

        test("deve cadastrar o produto quando os dados forem válidos", () => {
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

        test("deve preservar o erro original do banco para o Controller", () => {
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

        test("deve marcar a duplicidade detectada na verificação prévia", () => {
            connection.query.mockImplementation((sql, valores, callback) => callback(null, [{ id_produto: 1 }]));

            const callback = jest.fn();

            cadastrarProduto({ sku: 'SKU-001', nome: 'Fonte', categoria: 'Componentes' }, callback);

            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'SKU_DUPLICADO', message: 'SKU já cadastrado' })
            );
        });
    });
});