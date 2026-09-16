document.addEventListener("DOMContentLoaded", () => {

    const editForm =
        document.querySelector("#editUserForm");

    const formMessage =
        document.querySelector("#formMessage");

    const userIdInput =
        document.querySelector("#userId");


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
     * Obtém o ID pela URL
     *
     * Exemplo:
     * editar_usuario.html?id=1
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const userId =
        params.get("id");


    if (!userId) {

        mostrarMensagem(
            "Usuário não informado.",
            "error"
        );

        return;
    }


    userIdInput.value = userId;


    /*
     * Carrega os dados atuais
     */

    carregarUsuario(userId);


    /*
     * Salvar alterações
     */

    editForm.addEventListener(
        "submit",
        salvarUsuario
    );


    /*
     * Função para buscar usuário
     */

    async function carregarUsuario(id) {

        try {

            const resposta =
                await fetch(
                    `/api/usuarios/${id}`
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível carregar o usuário."
                );

            }


            /*
             * Preenche os campos
             */

            fields.nome.value =
                dados.nome;

            fields.email.value =
                dados.email;

            fields.login.value =
                dados.login;

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
     * Salva alterações
     */

    async function salvarUsuario(event) {

        event.preventDefault();


        limparErros();


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
         * Nome
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
         * E-mail
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
         * Login
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
         * Perfil
         */

        if (!perfil) {

            mostrarErro(
                fields.perfil,
                errors.perfil,
                "Selecione o perfil."
            );

            valido = false;
        }


        if (!valido) {

            mostrarMensagem(
                "Corrija os campos destacados antes de continuar.",
                "error"
            );

            return;
        }


        try {

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
                             * enquanto o projeto não possui
                             * autenticação no Back-end.
                             */

                            "X-Perfil":
                                localStorage.getItem(
                                    "perfil"
                                ) || "Administrador"
                        },

                        body: JSON.stringify({

                            nome: nome,

                            email: email,

                            login: login,

                            id_nivel_acesso:
                                Number(perfil)

                        })

                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível atualizar o usuário."
                );

            }


            mostrarMensagem(
                "Usuário atualizado com sucesso.",
                "success"
            );


            /*
             * Retorna para a listagem
             */

            setTimeout(() => {

                window.location.href =
                    "usuarios.html";

            }, 1000);


        } catch (erro) {

            mostrarMensagem(
                erro.message,
                "error"
            );

        }

    }


    /*
     * Validação de e-mail
     */

    function validarEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /*
     * Exibe erro em campo
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
     * Limpa erros
     */

    function limparErros() {

        Object.values(errors)
            .forEach((elemento) => {

                elemento.textContent = "";

            });


        Object.values(fields)
            .forEach((campo) => {

                campo.classList.remove(
                    "field-invalid"
                );

            });


        formMessage.textContent = "";

        formMessage.className =
            "form-message";

    }


    /*
     * Mensagem geral
     */

    function mostrarMensagem(
        mensagem,
        tipo
    ) {

        formMessage.textContent =
            mensagem;


        if (tipo === "success") {

            formMessage.className =
                "form-message form-message-success";

        } else {

            formMessage.className =
                "form-message form-message-error";

        }

    }

});