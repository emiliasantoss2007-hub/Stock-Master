document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * =====================================================
         * ELEMENTOS DO FORMULÁRIO
         * =====================================================
         */

        const editForm =
            document.querySelector("#editUserForm");

        const formMessage =
            document.querySelector("#formMessage");

        const userIdInput =
            document.querySelector("#userId");

        const saveButton =
            editForm.querySelector(
                'button[type="submit"]'
            );


        /*
         * =====================================================
         * CAMPOS
         * =====================================================
         */

        const fields = {

            nome:
                document.querySelector("#nome"),

            email:
                document.querySelector("#email"),

            login:
                document.querySelector("#login"),

            perfil:
                document.querySelector("#perfil")

        };


        /*
         * =====================================================
         * CAMPOS DE ERRO
         * =====================================================
         */

        const errors = {

            nome:
                document.querySelector("#nomeError"),

            email:
                document.querySelector("#emailError"),

            login:
                document.querySelector("#loginError"),

            perfil:
                document.querySelector("#perfilError")

        };


        /*
         * =====================================================
         * IDENTIFICAÇÃO DO USUÁRIO
         * =====================================================
         *
         * O ID é recebido pela URL.
         *
         * Exemplo:
         *
         * editar_usuario.html?id=1
         *
         */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const userId =
            params.get("id");


        /*
         * =====================================================
         * VALIDAÇÃO DO ID
         * =====================================================
         */

        if (
            !userId ||
            !Number.isInteger(
                Number(userId)
            ) ||
            Number(userId) <= 0
        ) {

            mostrarMensagem(
                "Usuário não informado ou inválido.",
                "error"
            );

            bloquearFormulario();

            return;
        }


        /*
         * Guarda o ID no formulário.
         */
        userIdInput.value =
            userId;


        /*
         * =====================================================
         * INICIALIZAÇÃO
         * =====================================================
         */

        carregarUsuario(
            userId
        );


        editForm.addEventListener(
            "submit",
            salvarUsuario
        );


        /*
         * =====================================================
         * CARREGAR DADOS ATUAIS
         * =====================================================
         *
         * GET /api/usuarios/:id
         *
         * O Controller recebe a requisição,
         * consulta o Model e retorna os dados.
         *
         */

        async function carregarUsuario(
            id
        ) {

            mostrarMensagem(
                "Carregando dados do usuário...",
                "info"
            );


            bloquearFormulario();


            try {

                /*
                 * Perfil atual do usuário logado.
                 *
                 * O login do protótipo grava:
                 *
                 * Administrador
                 * ou
                 * Técnico
                 *
                 * no localStorage.
                 */
                const perfil =
                    localStorage.getItem(
                        "perfil"
                    ) ||
                    "Administrador";


                /*
                 * Requisição GET para o Controller.
                 */
                const resposta =
                    await fetch(
                        `/api/usuarios/${id}`,
                        {

                            method: "GET",

                            headers: {

                                "X-Perfil":
                                    perfil

                            }

                        }
                    );


                /*
                 * Tenta interpretar o retorno
                 * da API como JSON.
                 */
                const dados =
                    await obterRespostaJson(
                        resposta
                    );


                /*
                 * Caso o Controller tenha
                 * retornado erro.
                 */
                if (!resposta.ok) {

                    throw new Error(
                        dados.mensagem ||
                        "Não foi possível carregar os dados do usuário."
                    );
                }


                /*
                 * =================================================
                 * PREENCHIMENTO DO FORMULÁRIO
                 * =================================================
                 */

                fields.nome.value =
                    dados.nome || "";


                fields.email.value =
                    dados.email || "";


                fields.login.value =
                    dados.login || "";


                /*
                 * O banco trabalha com
                 * id_nivel_acesso.
                 *
                 * 1 = Administrador
                 * 2 = Técnico
                 */
                fields.perfil.value =
                    String(
                        dados.id_nivel_acesso || ""
                    );


                /*
                 * Dados carregados com sucesso.
                 */
                mostrarMensagem(
                    "Dados atuais carregados com sucesso.",
                    "success"
                );


            } catch (erro) {

                console.error(
                    "Erro ao carregar usuário:",
                    erro
                );


                mostrarMensagem(
                    erro.message ||
                    "Erro ao carregar os dados do usuário.",
                    "error"
                );


                bloquearFormulario();


                return;
            }


            /*
             * Libera o formulário após
             * carregar os dados.
             */
            desbloquearFormulario();

        }


        /*
         * =====================================================
         * SALVAR ALTERAÇÕES
         * =====================================================
         *
         * PUT /api/usuarios/:id
         *
         */

        async function salvarUsuario(
            event
        ) {

            event.preventDefault();


            /*
             * Limpa mensagens anteriores.
             */
            limparErros();


            /*
             * =================================================
             * OBTÉM OS VALORES
             * =================================================
             */

            const nome =
                fields.nome.value.trim();


            const email =
                fields.email.value.trim();


            const login =
                fields.login.value.trim();


            const perfil =
                fields.perfil.value;


            let valido = true;


            /*
             * =================================================
             * VALIDAÇÃO DO NOME
             * =================================================
             */

            if (!nome) {

                mostrarErro(
                    fields.nome,
                    errors.nome,
                    "Informe o nome completo."
                );

                valido = false;

            }


            /*
             * =================================================
             * VALIDAÇÃO DO E-MAIL
             * =================================================
             */

            if (!email) {

                mostrarErro(
                    fields.email,
                    errors.email,
                    "Informe o e-mail."
                );

                valido = false;

            } else if (
                !validarEmail(email)
            ) {

                mostrarErro(
                    fields.email,
                    errors.email,
                    "Informe um e-mail válido."
                );

                valido = false;

            }


            /*
             * =================================================
             * VALIDAÇÃO DO LOGIN
             * =================================================
             */

            if (!login) {

                mostrarErro(
                    fields.login,
                    errors.login,
                    "Informe o login."
                );

                valido = false;

            }


            /*
             * =================================================
             * VALIDAÇÃO DO PERFIL
             * =================================================
             */

            if (!perfil) {

                mostrarErro(
                    fields.perfil,
                    errors.perfil,
                    "Selecione o perfil de acesso."
                );

                valido = false;

            }


            /*
             * =================================================
             * SE HOUVER ERROS
             * =================================================
             */

            if (!valido) {

                mostrarMensagem(
                    "Corrija os campos destacados antes de continuar.",
                    "error"
                );

                return;
            }


            /*
             * =================================================
             * ENVIO PARA O CONTROLLER
             * =================================================
             */

            try {

                /*
                 * Impede duplo clique enquanto
                 * a requisição está sendo processada.
                 */
                bloquearFormulario();


                mostrarMensagem(
                    "Salvando alterações...",
                    "info"
                );


                /*
                 * Obtém o perfil do usuário logado.
                 */
                const perfilUsuario =
                    localStorage.getItem(
                        "perfil"
                    ) ||
                    "Administrador";


                /*
                 * Dados que serão enviados
                 * ao Controller.
                 */
                const dadosEnvio = {

                    nome:
                        nome,

                    email:
                        email,

                    login:
                        login,

                    id_nivel_acesso:
                        Number(perfil)

                };


                console.log(
                    "Dados enviados ao Controller:",
                    dadosEnvio
                );


                /*
                 * PUT
                 *
                 * /api/usuarios/:id
                 */
                const resposta =
                    await fetch(
                        `/api/usuarios/${userId}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "X-Perfil":
                                    perfilUsuario

                            },

                            body:
                                JSON.stringify(
                                    dadosEnvio
                                )

                        }
                    );


                /*
                 * Obtém o retorno do Controller.
                 */
                const dados =
                    await obterRespostaJson(
                        resposta
                    );


                console.log(
                    "Retorno do Controller:",
                    dados
                );


                /*
                 * =================================================
                 * TRATAMENTO DE ERROS
                 * =================================================
                 */

                if (!resposta.ok) {

                    /*
                     * 400
                     * Dados inválidos.
                     */

                    if (
                        resposta.status === 400
                    ) {

                        mostrarMensagem(
                            dados.mensagem ||
                            "Verifique os dados informados.",
                            "error"
                        );

                        desbloquearFormulario();

                        return;
                    }


                    /*
                     * 403
                     * Usuário sem autorização.
                     */

                    if (
                        resposta.status === 403
                    ) {

                        mostrarMensagem(
                            dados.mensagem ||
                            "Você não possui permissão para editar usuários.",
                            "error"
                        );

                        desbloquearFormulario();

                        return;
                    }


                    /*
                     * 404
                     * Usuário não encontrado.
                     */

                    if (
                        resposta.status === 404
                    ) {

                        mostrarMensagem(
                            dados.mensagem ||
                            "Usuário não encontrado.",
                            "error"
                        );

                        desbloquearFormulario();

                        return;
                    }


                    /*
                     * 409
                     * Login ou e-mail duplicado.
                     */

                    if (
                        resposta.status === 409
                    ) {

                        mostrarMensagem(
                            dados.mensagem ||
                            "Login ou e-mail já cadastrado.",
                            "error"
                        );

                        desbloquearFormulario();

                        return;
                    }


                    /*
                     * Outros erros.
                     */

                    throw new Error(
                        dados.mensagem ||
                        "Não foi possível atualizar o usuário."
                    );

                }


                /*
                 * =================================================
                 * SUCESSO
                 * =================================================
                 */

                mostrarMensagem(
                    dados.mensagem ||
                    "Usuário atualizado com sucesso!",
                    "success"
                );


                /*
                 * Atualiza o formulário com
                 * os dados efetivamente retornados
                 * pelo Controller.
                 *
                 * Isso confirma para a interface
                 * quais valores foram persistidos.
                 */
                if (
                    dados.dadosAtualizados
                ) {

                    preencherFormulario(
                        dados.dadosAtualizados
                    );

                }


                /*
                 * Aguarda um pouco para o usuário
                 * visualizar o retorno.
                 */
                setTimeout(
                    () => {

                        window.location.href =
                            "usuarios.html";

                    },
                    1200
                );


            } catch (erro) {

                console.error(
                    "Erro ao salvar usuário:",
                    erro
                );


                mostrarMensagem(
                    erro.message ||
                    "Erro ao comunicar com o Controller.",
                    "error"
                );


                desbloquearFormulario();

            }

        }


        /*
         * =====================================================
         * PREENCHER FORMULÁRIO
         * =====================================================
         */

        function preencherFormulario(
            usuario
        ) {

            fields.nome.value =
                usuario.nome || "";


            fields.email.value =
                usuario.email || "";


            fields.login.value =
                usuario.login || "";


            fields.perfil.value =
                String(
                    usuario.id_nivel_acesso || ""
                );

        }


        /*
         * =====================================================
         * VALIDAR E-MAIL
         * =====================================================
         */

        function validarEmail(
            email
        ) {

            return (
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            ).test(
                email
            );

        }


        /*
         * =====================================================
         * EXIBIR ERRO NO CAMPO
         * =====================================================
         */

        function mostrarErro(
            campo,
            elementoErro,
            mensagem
        ) {

            campo.classList.add(
                "field-invalid"
            );


            elementoErro.textContent =
                mensagem;

        }


        /*
         * =====================================================
         * LIMPAR ERROS
         * =====================================================
         */

        function limparErros() {

            Object.values(
                errors
            ).forEach(
                (elemento) => {

                    elemento.textContent =
                        "";

                }
            );


            Object.values(
                fields
            ).forEach(
                (campo) => {

                    campo.classList.remove(
                        "field-invalid"
                    );

                }
            );


            formMessage.textContent =
                "";


            formMessage.className =
                "form-message";

        }


        /*
         * =====================================================
         * EXIBIR RETORNO
         * =====================================================
         *
         * Tipos:
         *
         * success
         * error
         * info
         *
         */

        function mostrarMensagem(
            mensagem,
            tipo
        ) {

            formMessage.textContent =
                mensagem;


            formMessage.className =
                "form-message";


            if (
                tipo === "success"
            ) {

                formMessage.classList.add(
                    "form-message-success"
                );

            } else if (
                tipo === "error"
            ) {

                formMessage.classList.add(
                    "form-message-error"
                );

            } else {

                /*
                 * Para mensagens informativas,
                 * usamos a cor padrão da interface.
                 */

                formMessage.classList.add(
                    "form-message-info"
                );

            }

        }


        /*
         * =====================================================
         * BLOQUEAR FORMULÁRIO
         * =====================================================
         */

        function bloquearFormulario() {

            Object.values(
                fields
            ).forEach(
                (campo) => {

                    campo.disabled = true;

                }
            );


            if (saveButton) {

                saveButton.disabled = true;

            }

        }


        /*
         * =====================================================
         * LIBERAR FORMULÁRIO
         * =====================================================
         */

        function desbloquearFormulario() {

            Object.values(
                fields
            ).forEach(
                (campo) => {

                    campo.disabled = false;

                }
            );


            if (saveButton) {

                saveButton.disabled = false;

            }

        }


        /*
         * =====================================================
         * LER RESPOSTA DA API
         * =====================================================
         *
         * Evita que um erro inesperado do servidor
         * que não seja JSON quebre o JavaScript.
         */

        async function obterRespostaJson(
            resposta
        ) {

            const texto =
                await resposta.text();


            if (!texto) {

                return {};

            }


            try {

                return JSON.parse(
                    texto
                );

            } catch (erro) {

                throw new Error(
                    "O servidor retornou uma resposta inválida."
                );

            }

        }

    }
);