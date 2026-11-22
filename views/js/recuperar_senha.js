"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const recoveryForm = document.querySelector("#recoveryForm");

    const emailInput = document.querySelector("#email");
    const emailError = document.querySelector("#emailError");

    const tokenGroup = document.querySelector("#tokenGroup");
    const tokenInput = document.querySelector("#token");
    const tokenError = document.querySelector("#tokenError");

    const formMessage = document.querySelector("#formMessage");

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
        );
        return;
    }

    recoveryForm.addEventListener("submit", async (event) => {

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
});
