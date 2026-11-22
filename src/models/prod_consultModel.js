
"use strict";

const db = require("../config/database");

// Consulta produtos cadastrados no banco de dados
async function consultarProdutos(filtros = {}) {
    try {
        // Validação dos filtros recebidos
        if (!filtros || typeof filtros !== "object" || Array.isArray(filtros)) {
            return {
                success: false,
                status: 400,
                message: "Filtros de consulta inválidos."
            };
        }

        const nome = typeof filtros.nome === "string"
            ? filtros.nome.trim()
            : "";

        const categoria = typeof filtros.categoria === "string"
            ? filtros.categoria.trim()
            : "";

        const sku = typeof filtros.sku === "string"
            ? filtros.sku.trim()
            : "";

        // Consulta base
        let sql = `
            SELECT
                id_produto AS idProduto,
                sku,
                codigo_barras AS codigoBarras,
                nome,
                categoria,
                descricao,
                quantidade_estoque AS quantidadeEstoque,
                estoque_minimo AS estoqueMinimo,
                valor
            FROM produto
        `;

        const condicoes = [];
        const parametros = [];

        // Pesquisa parcial pelo nome
        if (nome !== "") {
            condicoes.push("nome LIKE ?");
            parametros.push(`%${nome}%`);
        }

        // Pesquisa parcial pela categoria
        if (categoria !== "") {
            condicoes.push("categoria LIKE ?");
            parametros.push(`%${categoria}%`);
        }

        // Pesquisa exata pelo SKU
        if (sku !== "") {
            condicoes.push("sku = ?");
            parametros.push(sku);
        }

        // Aplica os filtros informados
        if (condicoes.length > 0) {
            sql += " WHERE " + condicoes.join(" AND ");
        }

        // Ordenação alfabética
        sql += " ORDER BY nome ASC";

        // Executa a consulta no MySQL
        const [produtos] = await db.promise().execute(sql, parametros);

        return {
            success: true,
            status: 200,
            message: produtos.length > 0
                ? "Consulta realizada com sucesso."
                : "Nenhum produto encontrado para os filtros informados.",
            data: produtos
        };

    } catch (erro) {
        console.error("Erro ao consultar produtos:", erro);

        return {
            success: false,
            status: 500,
            message: "Não foi possível consultar os produtos."
        };
    }
}

module.exports = {
    consultarProdutos
};