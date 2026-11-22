
"use strict";

const db = require("../config/database");

const SaidaEstoqueModel = {

    // Consulta o saldo atual de um produto
    async consultarSaldo({ idProduto } = {}) {
        try {
            if (!Number.isInteger(Number(idProduto)) || Number(idProduto) <= 0) {
                return {
                    success: false,
                    status: 400,
                    message: "Produto não identificado."
                };
            }

            const [rows] = await db.promise().execute(
                `SELECT id_produto, quantidade_estoque
                 FROM produto
                 WHERE id_produto = ?`,
                [Number(idProduto)]
            );

            if (rows.length === 0) {
                return {
                    success: false,
                    status: 404,
                    message: "Produto não encontrado."
                };
            }

            return {
                success: true,
                status: 200,
                data: {
                    idProduto: rows[0].id_produto,
                    quantidadeEstoque: rows[0].quantidade_estoque
                }
            };

        } catch (erro) {
            console.error("[SaidaEstoqueModel] Erro ao consultar saldo:", erro);

            return {
                success: false,
                status: 500,
                message: "Erro ao consultar estoque."
            };
        }
    },

    // Registra a saída e atualiza o estoque
    async registrarSaida({
        idProduto,
        quantidade,
        justificativa = null,
        idUsuario
    } = {}) {

        let conexao;

        try {
            const produtoId = Number(idProduto);
            const quantidadeSaida = Number(quantidade);
            const usuarioId = Number(idUsuario);

            if (!Number.isInteger(produtoId) || produtoId <= 0) {
                return {
                    success: false,
                    status: 400,
                    message: "Produto não identificado."
                };
            }

            if (!Number.isInteger(quantidadeSaida) || quantidadeSaida <= 0) {
                return {
                    success: false,
                    status: 400,
                    message: "Quantidade inválida."
                };
            }

            if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
                return {
                    success: false,
                    status: 401,
                    message: "Usuário não identificado."
                };
            }

            conexao = db.promise();

            await conexao.beginTransaction();

            // Bloqueia o registro durante a operação
            const [produtos] = await conexao.execute(
                `SELECT id_produto, quantidade_estoque
                 FROM produto
                 WHERE id_produto = ?
                 FOR UPDATE`,
                [produtoId]
            );

            if (produtos.length === 0) {
                await conexao.rollback();

                return {
                    success: false,
                    status: 404,
                    message: "Produto não encontrado."
                };
            }

            const estoqueAtual = produtos[0].quantidade_estoque;

            if (quantidadeSaida > estoqueAtual) {
                await conexao.rollback();

                return {
                    success: false,
                    status: 409,
                    message: "Quantidade solicitada superior ao estoque disponível."
                };
            }

            const novoEstoque = estoqueAtual - quantidadeSaida;

            // Atualiza o estoque do produto
            await conexao.execute(
                `UPDATE produto
                 SET quantidade_estoque = ?
                 WHERE id_produto = ?`,
                [novoEstoque, produtoId]
            );

            // Registra a movimentação de saída
            await conexao.execute(
                `INSERT INTO movimentacao
                    (tipo_movimentacao, quantidade, justificativa, id_produto, id_usuario)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    "saida",
                    quantidadeSaida,
                    justificativa || null,
                    produtoId,
                    usuarioId
                ]
            );

            await conexao.commit();

            return {
                success: true,
                status: 200,
                message: "Saída registrada com sucesso.",
                data: {
                    idProduto: produtoId,
                    quantidade: quantidadeSaida,
                    estoqueAnterior: estoqueAtual,
                    estoqueAtual: novoEstoque
                }
            };

        } catch (erro) {
            if (conexao) {
                await conexao.rollback();
            }

            console.error("[SaidaEstoqueModel] Erro ao registrar saída:", erro);

            return {
                success: false,
                status: 500,
                message: "Não foi possível registrar a saída."
            };

        } 
    }

};

module.exports = SaidaEstoqueModel;