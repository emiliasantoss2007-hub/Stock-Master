"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const recoveryForm = document.querySelector("#recoveryForm");

    const emailInput = document.querySelector("#email");
    const emailError = document.querySelector("#emailError");

    const tokenGroup = document.querySelector("#tokenGroup");
    const tokenInput = document.querySelector("#token");
    const tokenError = document.querySelector("#tokenError");

    const formMessage = document.querySelector("#formMessage");

<<<<<<< HEAD
    // Verifica se os elementos necessários existem
    if (!recoveryForm || !emailInput || !emailError || !formMessage) {
        console.error(
            "Erro: elementos do formulário de recuperação de senha não foram encontrados."
=======
    let tokenGerado = false;

    if (
        !recoveryForm ||
        !emailInput ||
        !emailError ||
        !tokenGroup ||
        !tokenInput ||
        !tokenError ||
        !formMessage
    ) {
        console.error(
            "Erro: elementos da tela de recuperação não foram encontrados."
>>>>>>> ca5f574c90fce6ba91f9f7c338acf33d3007cebf
        );
        return;
    }

    recoveryForm.addEventListener("submit", async (event) => {
<<<<<<< HEAD
        event.preventDefault();

        const email = emailInput.value.trim();

        // Regex para validação básica de e-mail
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        // Limpa mensagens e estados anteriores
        emailError.textContent = "";
        formMessage.textContent = "";

        emailInput.classList.remove("input-invalid", "input-valid");

        formMessage.style.color = "";

        // Validação: campo vazio
        if (!email) {
            emailError.textContent = "Por favor, informe o e-mail.";
            emailInput.classList.add("input-invalid");
            emailInput.focus();
            return;
        }

        // Validação: e-mail inválido
        if (!emailValido) {
            emailError.textContent = "Digite um e-mail válido.";
            emailInput.classList.add("input-invalid");
            emailInput.focus();
            return;
        }

        // E-mail válido
        emailInput.classList.add("input-valid");

        // Desabilita o botão durante a requisição
        const submitButton = recoveryForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            // Envia solicitação para o backend
            const response = await fetch("/recuperar-senha/solicitar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                }),
            });

            // Tenta interpretar a resposta como JSON
            let data = {};

            try {
                data = await response.json();
            } catch (jsonError) {
                console.warn("A resposta do servidor não está em formato JSON.");
            }

            // Solicitação realizada com sucesso
            if (response.ok) {
                formMessage.style.color = "green";
                formMessage.textContent =
                    data.message ||
                    "Instruções para recuperação de senha foram enviadas para o e-mail informado.";

                recoveryForm.reset();
                emailInput.classList.remove("input-valid");
            } else {
                // Erro retornado pelo backend
                formMessage.style.color = "red";
                formMessage.textContent =
                    data.error ||
                    data.message ||
                    "Ocorreu um erro ao processar a solicitação.";
            }
        } catch (error) {
            console.error("Erro na requisição:", error);

            formMessage.style.color = "red";
            formMessage.textContent =
                "Erro de conexão com o servidor. Tente novamente mais tarde.";
        } finally {
            // Libera novamente o botão
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
=======

    event.preventDefault();

    const email = emailInput.value.trim();
    const token = tokenInput.value.trim();

    emailInput.classList.remove("input-invalid", "input-valid");
    tokenInput.classList.remove("input-invalid", "input-valid");

    emailError.textContent = "";
    tokenError.textContent = "";

    formMessage.textContent = "";
    formMessage.className = "form-message";

    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (email === "") {

        emailInput.classList.add("input-invalid");

        emailError.textContent =
            "Informe o e-mail cadastrado.";

        return;
    }

    if (!emailValido) {

        emailInput.classList.add("input-invalid");

        emailError.textContent =
            "Informe um e-mail válido, como usuario@exemplo.com.";

        return;
    }

    const botao =
        recoveryForm.querySelector("button[type='submit']");

    botao.disabled = true;

    try {

        // PRIMEIRA ETAPA: verificar e-mail e gerar token
        if (!tokenGerado) {

            formMessage.textContent =
                "Verificando e-mail...";

            formMessage.className =
                "form-message form-message--loading";

            const respostaEmail = await fetch(
                "/api/auth/verificar-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email
                    })
                }
            );

            const dadosEmail = await respostaEmail.json();

            if (!dadosEmail.success) {

                formMessage.textContent =
                    dadosEmail.message;

                formMessage.className =
                    "form-message form-message--error";

                botao.disabled = false;

                return;
            }

            formMessage.textContent =
                "Gerando token de recuperação...";

            const respostaToken = await fetch(
                "/api/auth/gerar-token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email
                    })
                }
            );

            const dadosToken = await respostaToken.json();

            if (!dadosToken.success) {

                formMessage.textContent =
                    dadosToken.message;

                formMessage.className =
                    "form-message form-message--error";

                botao.disabled = false;

                return;
            }

            emailInput.classList.add("input-valid");

            tokenGroup.hidden = false;

            tokenGerado = true;

            tokenInput.value = dadosToken.data.token;

            formMessage.textContent =
                "Token gerado com sucesso. Como esta é uma simulação, o token é exibido abaixo.";

            formMessage.className =
                "form-message form-message--success";

            tokenInput.focus();

            botao.textContent = "Validar token";

            botao.disabled = false;

            return;
        }

        // SEGUNDA ETAPA: validar token
        if (token === "") {

            tokenInput.classList.add("input-invalid");

            tokenError.textContent =
                "Informe o token de recuperação.";

            botao.disabled = false;

            return;
        }

        if (!/^\d{6}$/.test(token)) {

            tokenInput.classList.add("input-invalid");

            tokenError.textContent =
                "O token deve possuir 6 dígitos.";

            botao.disabled = false;

            return;
        }

        formMessage.textContent =
            "Validando token...";

        formMessage.className =
            "form-message form-message--loading";

        const respostaValidacao = await fetch(
            "/api/auth/validar-token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    token
                })
            }
        );

        const dadosValidacao =
            await respostaValidacao.json();

        if (!dadosValidacao.success) {

            tokenInput.classList.add("input-invalid");

            tokenError.textContent =
                dadosValidacao.message;

            formMessage.textContent = "";

            formMessage.className =
                "form-message";

            botao.disabled = false;

            return;
        }

        tokenInput.classList.add("input-valid");

        formMessage.textContent =
            "Token validado com sucesso!";

        formMessage.className =
            "form-message form-message--success";

        window.setTimeout(() => {

            window.location.href =
                `redefinir_senha.html?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

        }, 700);

    } catch (erro) {

        console.error(
            "Erro no processo de recuperação:",
            erro
        );

        formMessage.textContent =
            "Não foi possível concluir a recuperação. Tente novamente.";

        formMessage.className =
            "form-message form-message--error";

        botao.disabled = false;
    }
});
>>>>>>> ca5f574c90fce6ba91f9f7c338acf33d3007cebf
});

