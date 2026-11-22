"use strict";

const bcrypt = require("bcrypt");
const connection = require("../config/database");

// Armazenamento temporário dos tokens de recuperação
const tokensRecuperacao = new Map();

const senhaModel = {

    async alterarSenha({ email, token, novaSenha, confirmacaoNovaSenha }) {

        if (!email || !token || !novaSenha || !confirmacaoNovaSenha) {
            return {
                success: false,
                status: 400,
                message: "Preencha todos os campos obrigatórios."
            };
        }

        if (novaSenha !== confirmacaoNovaSenha) {
            return {
                success: false,
                status: 400,
                message: "A confirmação da senha não confere com a nova senha."
            };
        }

        const tokenValido = await senhaModel.validarToken(email, token);
        if (!tokenValido.success) {
            return tokenValido;
        }

        const novaSenhaValida =
            typeof novaSenha === "string" &&
            novaSenha.length >= 8 &&
            /[A-Z]/.test(novaSenha) &&
            /[a-z]/.test(novaSenha) &&
            /[0-9]/.test(novaSenha) &&
            /[^A-Za-z0-9]/.test(novaSenha);

        if (!novaSenhaValida) {
            return {
                success: false,
                status: 400,
                message:
                    "A nova senha deve ter no mínimo 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial."
            };
        }

        try {

            const [usuarios] = await connection.promise().query(
                `SELECT id_usuario, email, status
                 FROM usuario
                 WHERE email = ?
                 LIMIT 1`,
                [email]
            );

            if (usuarios.length === 0 || !usuarios[0].status) {
                return {
                    success: false,
                    status: 400,
                    message: "Não foi possível realizar a alteração de senha."
                };
            }

            const usuario = usuarios[0];

            const senhaHash = await bcrypt.hash(novaSenha, 10);

            await connection.promise().query(
                `UPDATE usuario
                 SET senha_hash = ?
                 WHERE id_usuario = ?`,
                [senhaHash, usuario.id_usuario]
            );

            tokensRecuperacao.delete(email);

            return {
                success: true,
                status: 200,
                message: "Senha alterada com sucesso.",
                data: {
                    id_usuario: usuario.id_usuario,
                    email: usuario.email
                }
            };

        } catch (erro) {

            console.error("Erro ao alterar senha:", erro);

            return {
                success: false,
                status: 500,
                message: "Erro interno ao alterar a senha."
            };
        }
    },
        async verificarEmail(email) {

        if (!email) {
            return {
                success: false,
                status: 400,
                message: "Informe o e-mail cadastrado."
            };
        }

        try {

            const [usuarios] = await connection.promise().query(
                `SELECT id_usuario, email, status
                 FROM usuario
                 WHERE email = ?
                 LIMIT 1`,
                [email]
            );

            if (usuarios.length === 0 || !usuarios[0].status) {
                return {
                    success: false,
                    status: 400,
                    message: "E-mail não encontrado."
                };
            }

            return {
                success: true,
                status: 200,
                message: "E-mail encontrado.",
                data: {
                    id_usuario: usuarios[0].id_usuario,
                    email: usuarios[0].email
                }
            };

        } catch (erro) {

            console.error("Erro ao verificar e-mail:", erro);

            return {
                success: false,
                status: 500,
                message: "Erro interno ao verificar o e-mail."
            };
        }
        },

    async gerarToken(email) {

        if (!email) {
            return {
                success: false,
                status: 400,
                message: "E-mail não informado."
            };
        }

        try {

            const [usuarios] = await connection.promise().query(
                `SELECT id_usuario, email, status
                 FROM usuario
                 WHERE email = ?
                 LIMIT 1`,
                [email]
            );

            if (usuarios.length === 0 || !usuarios[0].status) {
                return {
                    success: false,
                    status: 400,
                    message: "E-mail não encontrado."
                };
            }

            const token = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            const expiracao = Date.now() + (5 * 60 * 1000);

            tokensRecuperacao.set(email, {
                token,
                expiracao
            });

            return {
                success: true,
                status: 200,
                message: "Token de recuperação gerado.",
                data: {
                    email,
                    token,
                    expiracao
                }
            };

        } catch (erro) {

            console.error("Erro ao gerar token:", erro);

            return {
                success: false,
                status: 500,
                message: "Erro interno ao gerar o token."
            };
                }
    },

    async validarToken(email, token) {

        if (!email || !token) {
            return {
                success: false,
                status: 400,
                message: "E-mail e token são obrigatórios."
            };
        }

        const dadosToken = tokensRecuperacao.get(email);

        if (!dadosToken) {
            return {
                success: false,
                status: 400,
                message: "Token inválido ou não encontrado."
            };
        }

        if (Date.now() > dadosToken.expiracao) {

            tokensRecuperacao.delete(email);

            return {
                success: false,
                status: 400,
                message: "O token expirou. Solicite um novo token."
            };
        }

        if (dadosToken.token !== token) {
            return {
                success: false,
                status: 400,
                message: "Token inválido."
            };
        }

        return {
            success: true,
            status: 200,
            message: "Token válido."
        };
    }

};

module.exports = senhaModel;