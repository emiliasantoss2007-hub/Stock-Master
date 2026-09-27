const UsuarioModel =
    require('../models/usuarioModel');


/*
 * =====================================================
 * VERIFICAR ADMINISTRADOR
 * =====================================================
 */

function usuarioEhAdministrador(
    req
) {

    if (
        req.usuario &&
        Number(
            req.usuario.id_nivel_acesso
        ) === 1
    ) {

        return true;

    }


    const perfilHeader =
        req.headers[
            'x-perfil'
        ];


    return (
        typeof perfilHeader ===
            'string' &&
        perfilHeader.toLowerCase() ===
            'administrador'
    );

}


/*
 * =====================================================
 * LISTAR USUÁRIOS
 * =====================================================
 *
 * GET /api/usuarios
 *
 */

const listarUsuarios =
    async (
        req,
        res
    ) => {

        try {

            /*
             * Consulta os usuários no Model.
             */

            const usuarios =
                await UsuarioModel
                    .listarTodos();


            /*
             * Retorna a lista para a View.
             */

            return res
                .status(200)
                .json({

                    sucesso: true,

                    usuarios

                });


        } catch (error) {

            console.error(
                'Erro ao listar usuários:',
                error
            );


            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        'Erro interno ao carregar os usuários.'

                });

        }

    };


/*
 * =====================================================
 * BUSCAR USUÁRIO POR ID
 * =====================================================
 *
 * GET /api/usuarios/:id
 *
 */

const buscarUsuario =
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            /*
             * Validação do ID.
             */

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Identificação do usuário inválida.'

                    });

            }


            /*
             * Consulta o Model.
             */

            const usuario =
                await UsuarioModel
                    .buscarPorId(
                        id
                    );


            /*
             * Usuário inexistente.
             */

            if (
                !usuario
            ) {

                return res
                    .status(404)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Usuário não encontrado.'

                    });

            }


            return res
                .status(200)
                .json(
                    usuario
                );


        } catch (error) {

            console.error(
                'Erro ao buscar usuário:',
                error
            );


            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        'Erro interno ao buscar usuário.'

                });

        }

    };


/*
 * =====================================================
 * ATUALIZAR USUÁRIO
 * =====================================================
 *
 * PUT /api/usuarios/:id
 *
 */

const atualizarUsuario =
    async (
        req,
        res
    ) => {

        try {

            /*
             * RN04:
             * somente Administrador pode editar
             * usuários.
             */

            if (
                !usuarioEhAdministrador(
                    req
                )
            ) {

                return res
                    .status(403)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Acesso negado. Apenas administradores podem editar usuários.'

                    });

            }


            const id =
                Number(
                    req.params.id
                );


            const {
                nome,
                email,
                login,
                id_nivel_acesso
            } = req.body;


            /*
             * Validação do ID.
             */

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Identificação do usuário inválida.'

                    });

            }


            /*
             * Validação dos campos.
             */

            if (
                !nome?.trim() ||
                !email?.trim() ||
                !login?.trim() ||
                id_nivel_acesso ===
                    undefined ||
                id_nivel_acesso ===
                    null ||
                id_nivel_acesso ===
                    ''
            ) {

                return res
                    .status(400)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Preencha todos os campos obrigatórios.'

                    });

            }


            const nivel =
                Number(
                    id_nivel_acesso
                );


            /*
             * Validação do perfil.
             */

            if (
                !Number.isInteger(
                    nivel
                ) ||
                nivel <= 0
            ) {

                return res
                    .status(400)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Perfil de acesso inválido.'

                    });

            }


            /*
             * Validação do e-mail.
             */

            const emailValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(
                        email.trim()
                    );


            if (
                !emailValido
            ) {

                return res
                    .status(400)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Informe um e-mail válido.'

                    });

            }


            /*
             * Executa a atualização.
             */

            const dadosAtualizados =
                await UsuarioModel
                    .atualizarComTransacao(
                        id,
                        nome.trim(),
                        email.trim(),
                        login.trim(),
                        nivel
                    );


            return res
                .status(200)
                .json({

                    sucesso: true,

                    mensagem:
                        'Usuário atualizado com sucesso!',

                    dadosAtualizados

                });


        } catch (error) {

            console.error(
                'Erro no RF-05 (editar usuário):',
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


            if (
                error.code ===
                'ER_DUP_ENTRY'
            ) {

                return res
                    .status(409)
                    .json({

                        sucesso: false,

                        mensagem:
                            'Login ou e-mail já cadastrado.'

                    });

            }


            return res
                .status(500)
                .json({

                    sucesso: false,

                    mensagem:
                        'Erro interno ao atualizar usuário. A alteração foi desfeita.'

                });

        }

    };


/*
 * =====================================================
 * EXPORTAÇÕES
 * =====================================================
 */

module.exports = {

    listarUsuarios,

    buscarUsuario,

    atualizarUsuario

};