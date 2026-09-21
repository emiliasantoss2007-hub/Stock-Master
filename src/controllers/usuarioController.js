const UsuarioModel =
    require('../models/usuarioModel');


/*
 * Verifica se o usuário que está realizando
 * a operação possui perfil de Administrador.
 *
 * Enquanto o projeto ainda não possui uma
 * autenticação completa no Back-end, o sistema
 * utiliza o header X-Perfil como compatibilidade
 * com o protótipo atual.
 */
function usuarioEhAdministrador(req) {

    /*
     * Autorização pelo usuário autenticado
     * no servidor, quando disponível.
     */
    if (
        req.usuario &&
        Number(
            req.usuario.id_nivel_acesso
        ) === 1
    ) {

        return true;
    }


    /*
     * Compatibilidade com o protótipo atual.
     */
    const perfilHeader =
        req.headers['x-perfil'];


    return (
        typeof perfilHeader === 'string' &&
        perfilHeader.toLowerCase() ===
            'administrador'
    );
}


/*
 * Busca os dados de um usuário.
 *
 * GET /api/usuarios/:id
 */
const buscarUsuario =
    async (req, res) => {

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

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Identificação do usuário inválida.'
                });
            }


            /*
             * Busca o usuário no banco.
             */
            const usuario =
                await UsuarioModel.buscarPorId(
                    id
                );


            /*
             * Usuário não encontrado.
             */
            if (!usuario) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        'Usuário não encontrado.'
                });
            }


            /*
             * Retorna os dados encontrados.
             */
            return res.status(200).json(
                usuario
            );


        } catch (error) {

            console.error(
                'Erro ao buscar usuário:',
                error
            );


            return res.status(500).json({
                sucesso: false,
                mensagem:
                    'Erro interno ao buscar usuário.'
            });
        }
    };


/*
 * Atualiza os dados do usuário.
 *
 * PUT /api/usuarios/:id
 */
const atualizarUsuario =
    async (req, res) => {

        try {

            /*
             * RN04:
             * somente Administrador pode editar
             * usuários.
             */
            if (
                !usuarioEhAdministrador(req)
            ) {

                return res.status(403).json({
                    sucesso: false,
                    mensagem:
                        'Acesso negado. Apenas administradores podem editar usuários.'
                });
            }


            /*
             * Identificação do usuário.
             */
            const id =
                Number(
                    req.params.id
                );


            /*
             * Dados recebidos da View.
             */
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

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Identificação do usuário inválida.'
                });
            }


            /*
             * Validação dos campos obrigatórios.
             */
            if (
                !nome?.trim() ||
                !email?.trim() ||
                !login?.trim() ||
                id_nivel_acesso ===
                    undefined ||
                id_nivel_acesso ===
                    null ||
                id_nivel_acesso === ''
            ) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Preencha todos os campos obrigatórios.'
                });
            }


            /*
             * Converte o perfil para número.
             *
             * 1 = Administrador
             * 2 = Técnico
             */
            const nivel =
                Number(
                    id_nivel_acesso
                );


            /*
             * Validação do perfil.
             */
            if (
                !Number.isInteger(nivel) ||
                nivel <= 0
            ) {

                return res.status(400).json({
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


            if (!emailValido) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        'Informe um e-mail válido.'
                });
            }


            /*
             * Executa a atualização.
             *
             * O Model será responsável por:
             * - iniciar a transação;
             * - verificar se o usuário existe;
             * - verificar login duplicado;
             * - verificar e-mail duplicado;
             * - executar UPDATE;
             * - realizar COMMIT;
             * - confirmar a persistência.
             */
            const dadosAtualizados =
                await UsuarioModel.atualizarComTransacao(
                    id,
                    nome.trim(),
                    email.trim(),
                    login.trim(),
                    nivel
                );


            /*
             * Retorno de sucesso.
             */
            return res.status(200).json({

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


            /*
             * Erros específicos tratados
             * pelo Model.
             */
            if (error.statusCode) {

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


            /*
             * Violação de UNIQUE do banco.
             */
            if (
                error.code ===
                'ER_DUP_ENTRY'
            ) {

                return res.status(409).json({

                    sucesso: false,

                    mensagem:
                        'Login ou e-mail já cadastrado.'

                });
            }


            /*
             * Erro inesperado.
             *
             * Como a operação utiliza transação,
             * as alterações são desfeitas.
             */
            return res.status(500).json({

                sucesso: false,

                mensagem:
                    'Erro interno ao atualizar usuário. A alteração foi desfeita.'

            });
        }
    };


module.exports = {

    buscarUsuario,

    atualizarUsuario

};