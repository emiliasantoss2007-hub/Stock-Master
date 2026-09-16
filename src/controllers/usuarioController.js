const usuarioModel = require("../models/usuarioModel");


/*
 * GET /api/usuarios/:id
 *
 * Busca os dados atuais do usuário
 * para preencher a tela de edição.
 */
async function buscarUsuario(req, res) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                mensagem: "ID de usuário inválido."
            });

        }


        const usuario =
            await usuarioModel.buscarPorId(id);


        if (!usuario) {

            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });

        }


        res.json(usuario);

    } catch (erro) {

        console.error(
            "Erro ao buscar usuário:",
            erro
        );

        res.status(500).json({
            mensagem: "Erro interno ao buscar usuário."
        });

    }

}


/*
 * PUT /api/usuarios/:id
 *
 * Atualiza os dados do usuário.
 */
async function atualizarUsuario(req, res) {

    try {

        /*
         * RN04:
         * Apenas usuários autorizados podem editar
         * dados cadastrais.
         *
         * Como o projeto atual ainda não possui
         * autenticação no Back-end, utilizamos
         * temporariamente o header X-Perfil para
         * preparar a regra de autorização.
         */
        const perfilUsuario =
            req.headers["x-perfil"];


        if (
            perfilUsuario &&
            perfilUsuario.toLowerCase() !== "administrador"
        ) {

            return res.status(403).json({
                mensagem:
                    "Apenas usuários autorizados podem editar usuários."
            });

        }


        const id = Number(req.params.id);


        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                mensagem: "ID de usuário inválido."
            });

        }


        const {
            nome,
            email,
            login,
            id_nivel_acesso
        } = req.body;


        /*
         * Validação dos campos
         */

        if (!nome || !nome.trim()) {

            return res.status(400).json({
                mensagem: "Informe o nome do usuário."
            });

        }


        if (!email || !email.trim()) {

            return res.status(400).json({
                mensagem: "Informe o e-mail do usuário."
            });

        }


        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.trim()
            );


        if (!emailValido) {

            return res.status(400).json({
                mensagem: "Informe um e-mail válido."
            });

        }


        if (!login || !login.trim()) {

            return res.status(400).json({
                mensagem: "Informe o login do usuário."
            });

        }


        if (!id_nivel_acesso) {

            return res.status(400).json({
                mensagem: "Informe o perfil de acesso."
            });

        }


        /*
         * Verifica se o usuário existe
         */

        const usuario =
            await usuarioModel.buscarPorId(id);


        if (!usuario) {

            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });

        }


        /*
         * Verifica login duplicado
         */

        const loginExiste =
            await usuarioModel.verificarLogin(
                login.trim(),
                id
            );


        if (loginExiste) {

            return res.status(409).json({
                mensagem:
                    "Este login já está sendo utilizado."
            });

        }


        /*
         * Verifica e-mail duplicado
         */

        const emailExiste =
            await usuarioModel.verificarEmail(
                email.trim(),
                id
            );


        if (emailExiste) {

            return res.status(409).json({
                mensagem:
                    "Este e-mail já está sendo utilizado."
            });

        }


        /*
         * Atualização
         */

        await usuarioModel.atualizar(
            id,
            nome.trim(),
            email.trim(),
            login.trim(),
            Number(id_nivel_acesso)
        );


        res.json({
            mensagem:
                "Usuário atualizado com sucesso."
        });


    } catch (erro) {

        console.error(
            "Erro ao atualizar usuário:",
            erro
        );


        /*
         * Tratamento de duplicidade do MySQL
         */

        if (erro.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                mensagem:
                    "Login ou e-mail já cadastrado."
            });

        }


        res.status(500).json({
            mensagem:
                "Erro interno ao atualizar usuário."
        });

    }

}


module.exports = {
    buscarUsuario,
    atualizarUsuario
};