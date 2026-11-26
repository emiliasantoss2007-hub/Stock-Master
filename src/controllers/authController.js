
/* =========================================================
   STOCKMASTER — CONTROLLER DE AUTENTICAÇÃO
   RF-01 — Realizar Login
   ========================================================= */

"use strict";

const Autenticacao = require("../models/autenticacaoModel");
const sessaoService = require("../services/sessaoService");

function obterCookie(cookieHeader, nome) {
    if (!cookieHeader) return null;

    const cookie = cookieHeader
        .split(';')
        .map((parte) => parte.trim())
        .find((parte) => parte.startsWith(`${nome}=`));

    if (!cookie) return null;

    try {
        return decodeURIComponent(cookie.slice(nome.length + 1));
    } catch {
        return null;
    }
}

const AuthController = {

    async autenticar(req, res) {
        try {
            const { login, senha } = req.body;

            const resultado = await Autenticacao.autenticar({
                login,
                senha
            });

            if (resultado.success) {
                const perfil = resultado.data.perfil;
                const accessToken = sessaoService.criar({
                    id_usuario: resultado.data.id_usuario,
                    id_nivel_acesso: perfil.id,
                    perfil
                });

                res.cookie("stockmaster_session", accessToken, {
                    httpOnly: true,
                    secure: Boolean(req.secure) || process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/"
                });

                return res.status(resultado.status).json({ ...resultado, accessToken });
            }

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

    encerrarSessao(req, res) {
        const authorization = req.headers.authorization || '';
        const match = authorization.match(/^Bearer\s+(\S+)$/i);
        const bearerToken = match && match[1];

        const cookieToken = obterCookie(
            req.headers.cookie,
            'stockmaster_session'
        );

        if (bearerToken) {
            sessaoService.encerrar(bearerToken);
        }

        if (cookieToken && cookieToken !== bearerToken) {
            sessaoService.encerrar(cookieToken);
        }

        res.clearCookie('stockmaster_session', {
            httpOnly: true,
            secure: Boolean(req.secure) || process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return res.status(200).json({
            success: true,
            message: 'Sessão encerrada com sucesso.'
        });
    }

};

module.exports = AuthController;
