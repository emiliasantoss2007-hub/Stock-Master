"use strict";

const senhaModel = require("../models/senhaModel");

const passController = {

    async alterarSenha(req, res) {

        const {
            email,
            token,
            novaSenha,
            confirmacaoNovaSenha
        } = req.body;

        try {

            const resposta = await senhaModel.alterarSenha({
                email,
                token,
                novaSenha,
                confirmacaoNovaSenha
            });

            return res.status(resposta.status).json(resposta);

        } catch (erro) {

            console.error("Erro no Controller de alteração de senha:", erro);

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Erro interno ao tentar alterar a senha."
            });
        }
    },
    async verificarEmail(req, res) {

        const { email } = req.body;

        try {

            const resposta = await senhaModel.verificarEmail(email);

            return res.status(resposta.status).json(resposta);

        } catch (erro) {

            console.error("Erro no Controller de verificaÃ§Ã£o de e-mail:", erro);

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Erro interno ao verificar o e-mail."
            });
        }
    },
    async gerarToken(req, res) {

        const { email } = req.body;

        try {

            const resposta = await senhaModel.gerarToken(email);

            return res.status(resposta.status).json(resposta);

        } catch (erro) {

            console.error("Erro no Controller de geração do token:", erro);

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Erro interno ao gerar o token."
            });
                }
    },

    async validarToken(req, res) {

        const { email, token } = req.body;

        try {

            const resposta = await senhaModel.validarToken(
                email,
                token
            );

            return res.status(resposta.status).json(resposta);

        } catch (erro) {

            console.error(
                "Erro no Controller de validação do token:",
                erro
            );

            return res.status(500).json({
                success: false,
                status: 500,
                message: "Erro interno ao validar o token."
            });
        }
    }
};
    
module.exports = passController;