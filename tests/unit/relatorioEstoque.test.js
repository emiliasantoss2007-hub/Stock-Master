
jest.mock("../../src/config/database", () => ({
    query: jest.fn()
}));

const db = require("../../src/config/database");
const produtoController = require("../../src/controllers/produtoController");

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
}

describe("RF-17 — Integração Controller e Model", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("consulta o banco com os filtros e retorna o relatório", async () => {
        db.query.mockImplementation((sql, parametros, callback) => {
            callback(null, [{
                id_produto: 1,
                sku: "SKU001",
                nome: "Fonte",
                categoria: "Componentes",
                quantidade_estoque: 8,
                valor: "10.00",
                valor_estoque: "80.00"
            }]);
        });

        const req = {
            usuario: { id_nivel_acesso: 1 },
            query: {
                busca: " Fonte ",
                categoria: " Componentes ",
                apenasZerados: "false"
            }
        };

        const res = criarResposta();

        await produtoController.relatorioEstoque(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0][0])
            .toContain("nome LIKE ? OR sku LIKE ?");

        expect(db.query.mock.calls[0][0])
            .toContain("categoria = ?");

        expect(db.query.mock.calls[0][1]).toEqual([
            "%Fonte%",
            "%Fonte%",
            "Componentes"
        ]);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                sucesso: true,
                dados: expect.objectContaining({
                    resumo: {
                        totalItens: 1,
                        totalUnidades: 8,
                        produtosZerados: 0,
                        valorTotalEstoque: 80
                    },
                    itens: [
                        expect.objectContaining({
                            sku: "SKU001",
                            nome: "Fonte",
                            quantidadeEstoque: 8,
                            valorUnitario: 10,
                            valorEstoque: 80
                        })
                    ]
                })
            })
        );
    });

    test("aplica o filtro de produtos zerados", async () => {
        db.query.mockImplementation((sql, parametros, callback) => {
            callback(null, []);
        });

        const req = {
            usuario: { id_nivel_acesso: 1 },
            query: { apenasZerados: "true" }
        };

        const res = criarResposta();

        await produtoController.relatorioEstoque(req, res);

        expect(db.query.mock.calls[0][0])
            .toContain("quantidade_estoque = 0");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].dados.itens).toEqual([]);
    });

    test("bloqueia usuário que não é administrador", async () => {
        const req = {
            usuario: { id_nivel_acesso: 2 },
            query: {}
        };

        const res = criarResposta();

        await produtoController.relatorioEstoque(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(db.query).not.toHaveBeenCalled();
    });

    test("retorna erro quando a consulta ao banco falha", async () => {
        db.query.mockImplementation((sql, parametros, callback) => {
            callback(new Error("Falha na consulta"));
        });

        const req = {
            usuario: { id_nivel_acesso: 1 },
            query: {}
        };

        const res = criarResposta();

        const logOriginal = console.error;
        console.error = jest.fn();

        await produtoController.relatorioEstoque(req, res);

        console.error = logOriginal;

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: "Erro ao gerar relatório de estoque."
        });
    });
});
