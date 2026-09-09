document.addEventListener("DOMContentLoaded", () => {
    const editForm = document.querySelector("#editUserForm");
    const formMessage = document.querySelector("#formMessage");
    const userIdInput = document.querySelector("#userId");

    const fields = {
        nome: document.querySelector("#nome"),
        email: document.querySelector("#email"),
        login: document.querySelector("#login"),
        perfil: document.querySelector("#perfil"),
        status: document.querySelector("#status")
    };

    const errors = {
        nome: document.querySelector("#nomeError"),
        email: document.querySelector("#emailError"),
        login: document.querySelector("#loginError"),
        perfil: document.querySelector("#perfilError"),
        status: document.querySelector("#statusError")
    };

    /*
      Dados temporários para o protótipo.
      Posteriormente, esses dados serão substituídos por uma consulta ao banco/API.
    */
    const users = {
        "1": {
            nome: "Ana Souza",
            email: "ana.souza@stockmaster.com",
            login: "ana.souza",
            perfil: "Administrador",
            status: "Ativo"
        },
        "2": {
            nome: "Carlos Lima",
            email: "carlos.lima@stockmaster.com",
            login: "carlos.lima",
            perfil: "Técnico",
            status: "Ativo"
        },
        "3": {
            nome: "Marina Alves",
            email: "marina.alves@stockmaster.com",
            login: "marina.alves",
            perfil: "Técnico",
            status: "Inativo"
        }
    };

    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id") || "1";
    const selectedUser = users[userId];

    if (!selectedUser) {
        formMessage.textContent = "Usuário não encontrado para edição.";
        formMessage.className = "form-message form-message-error";
        return;
    }

    userIdInput.value = userId;
    fields.nome.value = selectedUser.nome;
    fields.email.value = selectedUser.email;
    fields.login.value = selectedUser.login;
    fields.perfil.value = selectedUser.perfil;
    fields.status.value = selectedUser.status;

    editForm.addEventListener("submit", (event) => {
        event.preventDefault();

        let formValid = true;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim());

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
            errors.email.textContent = "Informe um e-mail válido.";
            fields.email.classList.add("field-invalid");
            formValid = false;
        }

        if (!fields.login.value.trim()) {
            errors.login.textContent = "Informe o login do usuário.";
            fields.login.classList.add("field-invalid");
            formValid = false;
        }

        if (!fields.perfil.value) {
            errors.perfil.textContent = "Selecione o perfil de acesso.";
            fields.perfil.classList.add("field-invalid");
            formValid = false;
        }

        if (!fields.status.value) {
            errors.status.textContent = "Selecione o status do usuário.";
            fields.status.classList.add("field-invalid");
            formValid = false;
        }

        if (!formValid) {
            formMessage.textContent = "Corrija os campos destacados antes de continuar.";
            formMessage.className = "form-message form-message-error";
            return;
        }

        formMessage.textContent = "Alterações salvas com sucesso. Retornando à listagem...";
        formMessage.className = "form-message form-message-success";

        /* CONEXÃO JS: editar-usuario.html -> usuarios.html */
        window.setTimeout(() => {
            window.location.href = `usuarios.html?atualizado=${encodeURIComponent(userId)}`;
        }, 900);
    });
});
