"use strict";

const db = require("../config/database");

// Busca um produto pelo ID
async function buscarPorId(idProduto) {
    const [resultados] = await db.promise().execute(
        `SELECT
            id_produto,
            sku,
            codigo_barras,
            nome,
            categoria,
            descricao,
            quantidade_estoque,
            valor,
            estoque_minimo
         FROM produto
         WHERE id_produto = ?`,
        [idProduto]
    );

    return resultados.length > 0 ? resultados[0] : null;
}

// Atualiza os dados permitidos de um produto
async function editarProduto({ idProduto, dadosAtualizados }) {
    try {
        const produtoExistente = await buscarPorId(idProduto);

        if (!produtoExistente) {
            return {
                success: false,
                status: 404,
                message: "Produto não encontrado."
            };
        }

        const {
            codigoBarras,
            nome,
            categoria,
            descricao,
            valor
        } = dadosAtualizados;

        await db.promise().execute(
            `UPDATE produto
             SET
                codigo_barras = ?,
                nome = ?,
                categoria = ?,
                descricao = ?,
                valor = ?
             WHERE id_produto = ?`,
            [
                codigoBarras,
                nome,
                categoria,
                descricao,
                valor,
                idProduto
            ]
        );

        const produtoAtualizado = await buscarPorId(idProduto);

        return {
            success: true,
            status: 200,
            message: "Produto atualizado com sucesso.",
            data: produtoAtualizado
        };

    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return {
                success: false,
                status: 409,
                message: "Já existe um produto com esses dados únicos."
            };
        }

        throw erro;
    }
}

module.exports = {
    buscarPorId,
    editarProduto
};