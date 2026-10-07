/* =========================================================
   STOCKMASTER — CONTROLLER DE AUTENTICAÇÃO
   RF-01 — Realizar Login
   ========================================================= */

"use strict";

const Autenticacao = require("../models/autenticacaoModel");

const AuthController = {

    async autenticar(req, res) {
        try {
            const { login, senha } = req.body;

            const resultado = await Autenticacao.autenticar({
                login,
                senha
            });

            return res.status(resultado.status).json(resultado);

        } catch (erro) {
            console.error(
                "[StockMaster][AuthController] Erro:",
                erro.message
            );

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Não foi possível realizar o login no momento.",
                code: "INTERNAL_ERROR"
            });
        }
    }

};

module.exports = AuthController;