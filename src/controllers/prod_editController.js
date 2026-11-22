"use strict";

const produtoModel = require("../models/prod_EditModel");

async function editarProduto(req, res) {
    try {
        const idProduto = Number(req.params.id);

        const {
            codigoBarras,
            nome,
            categoria,
            descricao,
            valor
        } = req.body;

        // Validação do ID
        if (!Number.isInteger(idProduto) || idProduto <= 0) {
            return res.status(400).json({
                success: false,
                message: "ID do produto inválido."
            });
        }

        // Validação dos tipos recebidos
if (
    (codigoBarras !== undefined && codigoBarras !== null && typeof codigoBarras !== "string") ||
    (descricao !== undefined && descricao !== null && typeof descricao !== "string") ||
    typeof nome !== "string" ||
    typeof categoria !== "string" ||
    valor === "" ||
    valor === undefined ||
    valor === null
) {
    return res.status(400).json({
        success: false,
        message: "Dados enviados em formato inválido."
    });
}

// Tratamento dos dados recebidos
const dadosAtualizados = {
    codigoBarras: codigoBarras?.trim() || null,
    nome: nome.trim(),
    categoria: categoria.trim(),
    descricao: descricao?.trim() || null,
    valor: Number(valor)
};

// Validação dos campos obrigatórios
if (
    !dadosAtualizados.nome ||
    !dadosAtualizados.categoria ||
    !Number.isFinite(dadosAtualizados.valor) ||
    dadosAtualizados.valor < 0
) {
    return res.status(400).json({
        success: false,
        message: "Preencha corretamente os campos obrigatórios."
    });
}

        // Chamada ao Model
        const resultado = await produtoModel.editarProduto({
            idProduto,
            dadosAtualizados
        });

        return res.status(resultado.status).json(resultado);

    } catch (erro) {
        console.error("Erro ao editar produto:", erro);

        return res.status(500).json({
            success: false,
            message: "Não foi possível editar o produto. Tente novamente."
        });
    }
}

// Busca um produto pelo ID
async function buscarProduto(req, res) {
    try {
        const idProduto = Number(req.params.id);

        if (!Number.isInteger(idProduto) || idProduto <= 0) {
            return res.status(400).json({
                success: false,
                message: "ID do produto inválido."
            });
        }

        const produto = await produtoModel.buscarPorId(idProduto);

        if (!produto) {
            return res.status(404).json({
                success: false,
                message: "Produto não encontrado."
            });
        }

        return res.status(200).json({
            success: true,
            data: produto
        });

    } catch (erro) {
        console.error("Erro ao consultar produto:", erro);

        return res.status(500).json({
            success: false,
            message: "Não foi possível consultar o produto."
        });
    }
}

module.exports = {
    buscarProduto,
    editarProduto
};