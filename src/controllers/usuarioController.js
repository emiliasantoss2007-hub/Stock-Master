const UsuarioModel =
    require("../models/usuarioModel");

// EDITAR USUÁRIO

const editarUsuario =
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const {
                nome,
                email,
                login,
                id_nivel_acesso
            } = req.body;

            const usuarioLogado =
                req.usuario;

            // AUTORIZAÇÃO

            if (
                !usuarioLogado ||
                Number(
                    usuarioLogado.id_nivel_acesso
                ) !== 1
            ) {

                return res
                    .status(403)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Acesso negado. Apenas administradores podem editar usuários."
                    });
            }

            // VALIDAÇÃO

            if (
                !id ||
                !nome ||
                !email ||
                !login ||
                !id_nivel_acesso
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Preencha todos os campos obrigatórios."
                    });
            }

            // BUSCAR USUÁRIO

            const usuarioExistente =
                await UsuarioModel
                    .buscarPorId(id);

            if (
                !usuarioExistente
            ) {

                return res
                    .status(404)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Usuário não encontrado."
                    });
            }

            // VERIFICAR LOGIN

            const loginEmUso =
                await UsuarioModel
                    .verificarLogin(
                        login.trim(),
                        id
                    );

            if (
                loginEmUso
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            "O login informado já está em uso."
                    });
            }

            // VERIFICAR E-MAIL

            const emailEmUso =
                await UsuarioModel
                    .verificarEmail(
                        email.trim(),
                        id
                    );

            if (
                emailEmUso
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            "O e-mail informado já está em uso."
                    });
            }

            // ATUALIZAR

            const usuarioAtualizado =
                await UsuarioModel
                    .atualizarComTransacao(
                        id,
                        nome.trim(),
                        email.trim(),
                        login.trim(),
                        Number(
                            id_nivel_acesso
                        )
                    );

            return res
                .status(200)
                .json({

                    sucesso: true,

                    mensagem:
                        "Usuário atualizado com sucesso!",

                    dadosAtualizados:
                        usuarioAtualizado

                });

        } catch (error) {

            console.error(
                "Erro ao editar usuário:",
                error
            );

            if (
                error.statusCode
            ) {

                return res
                    .status(
                        error.statusCode
                    )
                    .json({

                        sucesso: false,

                        mensagem:
                            error.message

                    });
            }

            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        "Erro interno no servidor."

                });
        }
    };

// CONSULTAR USUÁRIOS

const listarUsuarios =
    async (req, res) => {

        try {

            const {
                busca,
                perfil,
                status,
                ordenarPor,
                direcao
            } = req.query;

            // FILTROS

            const filtros = {

                busca:
                    busca
                        ? busca.trim()
                        : "",

                perfil:
                    perfil
                        ? perfil.trim()
                        : "",

                status:
                    status !== undefined
                        ? status.trim()
                        : "",

                ordenarPor:
                    ordenarPor ||
                    "nome",

                direcao:
                    direcao ||
                    "asc"

            };

            // CONSULTA

            const usuarios =
                await UsuarioModel
                    .listar(
                        filtros
                    );

            // RETORNO

            return res
                .status(200)
                .json({

                    sucesso: true,

                    total:
                        usuarios.length,

                    filtrosAplicados:
                        filtros,

                    usuarios

                });

        } catch (error) {

            console.error(
                "Erro ao consultar usuários:",
                error
            );

            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        "Erro ao consultar usuários.",

                    usuarios: []

                });
        }
    };

// EXCLUIR USUÁRIO

const excluirUsuario =
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const usuarioLogado =
                req.usuario;

            // AUTORIZAÇÃO

            if (
                !usuarioLogado ||
                Number(
                    usuarioLogado.id_nivel_acesso
                ) !== 1
            ) {

                return res
                    .status(403)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Acesso negado. Apenas administradores podem excluir usuários."
                    });
            }

            // VALIDAR ID

            if (
                !id ||
                !Number.isInteger(
                    Number(id)
                ) ||
                Number(id) <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Identificador de usuário inválido."
                    });
            }

            // VERIFICAR USUÁRIO

            const usuarioExistente =
                await UsuarioModel
                    .buscarPorId(id);

            if (
                !usuarioExistente
            ) {

                return res
                    .status(404)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Usuário não encontrado."
                    });
            }

            // EXCLUIR

            const excluido =
                await UsuarioModel
                    .excluir(
                        id
                    );

            if (
                !excluido
            ) {

                return res
                    .status(409)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Não foi possível excluir o usuário."
                    });
            }

            return res
                .status(200)
                .json({

                    sucesso: true,

                    mensagem:
                        "Usuário excluído com sucesso.",

                    idUsuario:
                        Number(id)

                });

        } catch (error) {

            console.error(
                "Erro ao excluir usuário:",
                error
            );

            // USUÁRIO POSSUI REGISTROS RELACIONADOS

            if (
                error.code ===
                "ER_ROW_IS_REFERENCED_2" ||
                error.code ===
                "ER_ROW_IS_REFERENCED"
            ) {

                return res
                    .status(409)
                    .json({
                        sucesso: false,
                        mensagem:
                            "O usuário possui registros relacionados e não pode ser excluído. Considere suspender o acesso."
                    });
            }

            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        "Erro interno ao excluir usuário."

                });
        }
    };

// SUSPENDER USUÁRIO

const suspenderUsuario =
    async (req, res) => {

        try {

            const {
                id
            } = req.params;

            const usuarioLogado =
                req.usuario;

            // AUTORIZAÇÃO

            if (
                !usuarioLogado ||
                Number(
                    usuarioLogado.id_nivel_acesso
                ) !== 1
            ) {

                return res
                    .status(403)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Acesso negado. Apenas administradores podem suspender usuários."
                    });
            }

            // VALIDAR ID

            if (
                !id ||
                !Number.isInteger(
                    Number(id)
                ) ||
                Number(id) <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Identificador de usuário inválido."
                    });
            }

            // VERIFICAR USUÁRIO

            const usuarioExistente =
                await UsuarioModel
                    .buscarPorId(id);

            if (
                !usuarioExistente
            ) {

                return res
                    .status(404)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Usuário não encontrado."
                    });
            }

            // SUSPENDER

            const suspenso =
                await UsuarioModel
                    .suspender(
                        id
                    );

            if (
                !suspenso
            ) {

                return res
                    .status(409)
                    .json({
                        sucesso: false,
                        mensagem:
                            "Não foi possível suspender o usuário."
                    });
            }

            return res
                .status(200)
                .json({

                    sucesso: true,

                    mensagem:
                        "Usuário suspenso com sucesso.",

                    idUsuario:
                        Number(id)

                });

        } catch (error) {

            console.error(
                "Erro ao suspender usuário:",
                error
            );

            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        "Erro interno ao suspender usuário."

                });
        }
    };

module.exports = {

    editarUsuario,

    listarUsuarios,

    excluirUsuario,

    suspenderUsuario

};