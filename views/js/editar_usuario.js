document.addEventListener(
    "DOMContentLoaded",
    () => {


        /*
         * Formulário principal.
         */
        const editForm =
            document.querySelector(
                "#editUserForm"
            );


        /*
         * Mensagem geral do formulário.
         */
        const formMessage =
            document.querySelector(
                "#formMessage"
            );


        /*
         * Campo oculto com o ID do usuário.
         */
        const userIdInput =
            document.querySelector(
                "#userId"
            );


        /*
         * Campos do formulário.
         */
        const fields = {

            nome:
                document.querySelector(
                    "#nome"
                ),

            email:
                document.querySelector(
                    "#email"
                ),

            login:
                document.querySelector(
                    "#login"
                ),

            perfil:
                document.querySelector(
                    "#perfil"
                )

        };


        /*
         * Mensagens individuais
         * dos campos.
         */
        const errors = {

            nome:
                document.querySelector(
                    "#nomeError"
                ),

            email:
                document.querySelector(
                    "#emailError"
                ),

            login:
                document.querySelector(
                    "#loginError"
                ),

            perfil:
                document.querySelector(
                    "#perfilError"
                )

        };


        /*
         * Obtém o ID do usuário pela URL.
         *
         * Exemplo:
         *
         * editar_usuario.html?id=1
         */
        const params =
            new URLSearchParams(
                window.location.search
            );


        const userId =
            params.get("id");


        /*
         * Caso a página seja aberta sem
         * informar o usuário.
         */
        if (!userId) {

            mostrarMensagem(
                "Usuário não informado.",
                "error"
            );

            return;
        }


        /*
         * Armazena o ID no campo oculto.
         */
        userIdInput.value =
            userId;


        /*
         * Carrega os dados atuais
         * do usuário.
         */
        carregarUsuario(
            userId
        );


        /*
         * Evento de envio do formulário.
         */
        editForm.addEventListener(
            "submit",
            salvarUsuario
        );


        /*
         * Busca os dados atuais
         * do usuário no Back-end.
         */
        async function carregarUsuario(
            id
        ) {

            try {

                const resposta =
                    await fetch(
                        `/api/usuarios/${id}`
                    );


                const dados =
                    await resposta.json();


                /*
                 * Verifica se a API
                 * retornou erro.
                 */
                if (!resposta.ok) {

                    throw new Error(
                        dados.mensagem ||
                        "Não foi possível carregar o usuário."
                    );
                }


                /*
                 * Preenche os campos.
                 */
                fields.nome.value =
                    dados.nome;


                fields.email.value =
                    dados.email;


                fields.login.value =
                    dados.login;


                /*
                 * O valor do select é o
                 * id_nivel_acesso.
                 *
                 * 1 = Administrador
                 * 2 = Técnico
                 */
                fields.perfil.value =
                    dados.id_nivel_acesso;


            } catch (erro) {

                mostrarMensagem(
                    erro.message,
                    "error"
                );

            }

        }


        /*
         * Executa a operação de edição.
         */
        async function salvarUsuario(
            event
        ) {

            event.preventDefault();


            /*
             * Remove mensagens anteriores.
             */
            limparErros();


            /*
             * Obtém os dados preenchidos.
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
             * Validação do nome.
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
             * Validação do e-mail.
             */
            if (!email) {

                mostrarErro(
                    fields.email,
                    errors.email,
                    "Informe o e-mail."
                );

                valido = false;

            } else if (
                !validarEmail(
                    email
                )
            ) {

                mostrarErro(
                    fields.email,
                    errors.email,
                    "Informe um e-mail válido."
                );

                valido = false;
            }


            /*
             * Validação do login.
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
             * Validação do perfil.
             */
            if (!perfil) {

                mostrarErro(
                    fields.perfil,
                    errors.perfil,
                    "Selecione o perfil."
                );

                valido = false;
            }


            /*
             * Interrompe se houver erros
             * no preenchimento.
             */
            if (!valido) {

                mostrarMensagem(
                    "Corrija os campos destacados antes de continuar.",
                    "error"
                );

                return;
            }


            try {


                /*
                 * Envia a atualização para
                 * o Back-end.
                 */
                const resposta =
                    await fetch(
                        `/api/usuarios/${userId}`,
                        {

                            method: "PUT",


                            headers: {

                                "Content-Type":
                                    "application/json",


                                /*
                                 * Autorização temporária
                                 * enquanto o projeto ainda
                                 * não possui autenticação
                                 * completa no Back-end.
                                 */
                                "X-Perfil":
                                    localStorage.getItem(
                                        "perfil"
                                    ) ||
                                    "Administrador"

                            },


                            /*
                             * Dados enviados.
                             */
                            body:
                                JSON.stringify({

                                    nome:
                                        nome,

                                    email:
                                        email,

                                    login:
                                        login,

                                    id_nivel_acesso:
                                        Number(
                                            perfil
                                        )

                                })

                        }
                    );


                /*
                 * Converte a resposta para JSON.
                 */
                const dados =
                    await resposta.json();


                /*
                 * Verifica se a API
                 * retornou algum erro.
                 */
                if (!resposta.ok) {

                    throw new Error(
                        dados.mensagem ||
                        "Não foi possível atualizar o usuário."
                    );
                }


                /*
                 * Exibe mensagem de sucesso.
                 */
                mostrarMensagem(
                    "Usuário atualizado com sucesso.",
                    "success"
                );


                /*
                 * Retorna para a listagem
                 * após a mensagem.
                 */
                setTimeout(
                    () => {

                        window.location.href =
                            "usuarios.html";

                    },
                    1000
                );


            } catch (erro) {

                mostrarMensagem(
                    erro.message,
                    "error"
                );

            }

        }


        /*
         * Validação de e-mail.
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
         * Exibe erro em um campo.
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
         * Remove os erros anteriores.
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
         * Exibe mensagem geral
         * de sucesso ou erro.
         */
        function mostrarMensagem(
            mensagem,
            tipo
        ) {

            formMessage.textContent =
                mensagem;


            if (
                tipo === "success"
            ) {

                formMessage.className =
                    "form-message form-message-success";

            } else {

                formMessage.className =
                    "form-message form-message-error";

            }

        }

    }
);