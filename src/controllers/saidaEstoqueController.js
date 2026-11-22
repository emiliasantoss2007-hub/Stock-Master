"use strict";

const SaidaEstoqueModel = require("../models/saidaEstoqueModel");

const SaidaEstoqueController = {

    async consultarSaldo(req, res) {
        try {
            const idProduto = Number(req.params.id);

            const resultado = await SaidaEstoqueModel.consultarSaldo({
                idProduto
            });

            return res.status(resultado.status).json(resultado);

        } catch (erro) {
            console.error("[SaidaEstoqueController] Erro ao consultar saldo:", erro);

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Não foi possível consultar o estoque."
            });
        }
    },

    async registrarSaida(req, res) {
        try {
            const {
                idProduto,
                quantidade,
                justificativa
            } = req.body;

            const idUsuario = req.usuario.id_usuario;

            const resultado = await SaidaEstoqueModel.registrarSaida({
                idProduto,
                quantidade,
                justificativa,
                idUsuario
            });

            return res.status(resultado.status).json(resultado);

        } catch (erro) {
            console.error("[SaidaEstoqueController] Erro ao registrar saída:", erro);

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Não foi possível registrar a saída."
            });
        }
    }

};

module.exports = SaidaEstoqueController;