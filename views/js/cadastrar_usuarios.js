document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.querySelector("#userForm");
    const formMessage = document.querySelector("#formMessage");

    const fields = {
        nome: document.querySelector("#nome"),
        email: document.querySelector("#email"),
        login: document.querySelector("#login"),
        senha: document.querySelector("#senha"),
        perfil: document.querySelector("#perfil")
    };

    const errors = {
        nome: document.querySelector("#nomeError"),
        email: document.querySelector("#emailError"),
        login: document.querySelector("#loginError"),
        senha: document.querySelector("#senhaError"),
        perfil: document.querySelector("#perfilError")
    };

    userForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        let formValid = true;

        const emailValid =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim());

        Object.values(errors).forEach((error) => {
            error.textContent = "";
        });

        Object.values(fields).forEach((field) => {
            field.classList.remove("field-invalid");
        });

        if (!fields.nome.value.trim()) {
            errors.nome.textContent = "Informe o nome completo.";
            fields.nome.classList.add("field-invalid");
            formValid = false;
        }

        if (!emailValid) {
            errors.email.textContent = "Informe um e-mail valido.";
            fields.email.classList.add("field-invalid");
            formValid = false;
        }

        if (!fields.login.value.trim()) {
            errors.login.textContent = "Informe o login do usuario.";
            fields.login.classList.add("field-invalid");
            formValid = false;
        }

        if (fields.senha.value.length < 8) {
            errors.senha.textContent =
                "A senha deve possuir pelo menos 8 caracteres.";
            fields.senha.classList.add("field-invalid");
            formValid = false;
        }

        if (!fields.perfil.value) {
            errors.perfil.textContent = "Selecione o perfil de acesso.";
            fields.perfil.classList.add("field-invalid");
            formValid = false;
        }

        if (!formValid) {
            formMessage.textContent =
                "Corrija os campos destacados antes de continuar.";
            formMessage.className =
                "form-message form-message-error";
            return;
        }

        // Dados que serao enviados para o backend
        const dadosUsuario = {
            nome: fields.nome.value.trim(),
            email: fields.email.value.trim(),
            login: fields.login.value.trim(),
            senha: fields.senha.value,
            perfil: fields.perfil.value
        };

        try {
            formMessage.textContent = "Cadastrando usuario...";
            formMessage.className = "form-message";

            // Envia os dados para a rota POST /usuarios
            const resposta = await fetch("/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dadosUsuario)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.message || "Nao foi possivel cadastrar o usuario."
                );
            }

            formMessage.textContent =
                "Usuario cadastrado com sucesso. Retornando a listagem...";
            formMessage.className =
                "form-message form-message-success";

            // Retorna para a tela de usuarios apos o cadastro
            setTimeout(() => {
                window.location.href = "usuarios.html?cadastro=sucesso";
            }, 900);

        } catch (erro) {
            console.error("Erro ao cadastrar usuario:", erro);

            formMessage.textContent =
                erro.message || "Erro ao cadastrar usuario.";
            formMessage.className =
                "form-message form-message-error";
        }
    });
});
