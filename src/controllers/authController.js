
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

            // Se o login falhar, mantém a resposta original.
            if (!resultado.success) {
                return res.status(resultado.status).json(resultado);
            }

            // Renova a sessão para evitar reutilização de uma sessão anterior.
            await new Promise((resolve, reject) => {
                req.session.regenerate((erro) => {
                    if (erro) return reject(erro);
                    resolve();
                });
            });

            // Armazena somente os dados necessários do usuário.
            req.session.usuario = resultado.data;

            // Garante que a sessão seja salva antes de responder.
            await new Promise((resolve, reject) => {
                req.session.save((erro) => {
                    if (erro) return reject(erro);
                    resolve();
                });
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

    },

    sair(req, res) {
        req.session.destroy((erro) => {
            if (erro) {
                console.error(
                    "[StockMaster][AuthController] Erro ao encerrar sessão:",
                    erro.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Não foi possível encerrar a sessão."
                });
            }

            res.clearCookie("stockmaster.sid", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            });

            return res.status(200).json({
                success: true,
                message: "Logout realizado com sucesso."
            });
        });
    }

};

module.exports = AuthController;
