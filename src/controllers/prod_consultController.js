
"use strict";

const ConsultaProdutoModel = require("../models/prod_consultModel");

// Consulta os produtos e responde à requisição HTTP
async function consultarProdutos(req, res) {
    try {
        const { nome, categoria, sku } = req.query;

        // Filtros recebidos da View
        const filtros = {
            nome: nome || "",
            categoria: categoria || "",
            sku: sku || ""
        };

        // Chama o Model
        const resultado = await ConsultaProdutoModel.consultarProdutos(filtros);

        // Trata erros retornados pelo Model
        if (!resultado.success) {
            return res.status(resultado.status || 500).json({
                success: false,
                message: resultado.message
            });
        }

        // Retorna os produtos consultados
        return res.status(200).json({
            success: true,
            message: resultado.message,
            data: {
                produtos: resultado.data
            }
        });

    } catch (erro) {
        console.error("Erro no Controller de consulta:", erro);

        return res.status(500).json({
            success: false,
            message: "Não foi possível realizar a consulta de produtos."
        });
    }
}

module.exports = {
    consultarProdutos
};