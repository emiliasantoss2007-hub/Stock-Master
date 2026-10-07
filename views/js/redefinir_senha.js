"use strict";

const resetForm = document.querySelector("#resetForm");

const novaSenhaInput = document.querySelector("#novaSenha");
const confirmarSenhaInput = document.querySelector("#confirmarSenha");

const novaSenhaError = document.querySelector("#novaSenhaError");
const confirmarSenhaError = document.querySelector("#confirmarSenhaError");

const formMessage = document.querySelector("#formMessage");

// Recupera o e-mail enviado pela tela de recuperação
const parametros = new URLSearchParams(window.location.search);
const email = parametros.get("email");
const token = parametros.get("token");

resetForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const novaSenha = novaSenhaInput.value;
    const confirmacaoNovaSenha = confirmarSenhaInput.value;

    let formularioValido = true;

    novaSenhaInput.classList.remove("input-invalid", "input-valid");
    confirmarSenhaInput.classList.remove("input-invalid", "input-valid");

    novaSenhaError.textContent = "";
    confirmarSenhaError.textContent = "";

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (!email) {
        formMessage.textContent =
            "Não foi possível identificar o e-mail para redefinir a senha.";
        formMessage.classList.add("form-message--error");
        return;
    }
    
    if (!token) {
    formMessage.textContent =
        "Não foi possível identificar o token de recuperação.";
    formMessage.classList.add("form-message--error");
    return;
    }

    if (novaSenha.length < 8) {

        novaSenhaInput.classList.add("input-invalid");

        novaSenhaError.textContent =
            "A senha deve possuir pelo menos 8 caracteres.";

        formularioValido = false;

    } else {

        novaSenhaInput.classList.add("input-valid");
    }

    if (!confirmacaoNovaSenha) {

        confirmarSenhaInput.classList.add("input-invalid");

        confirmarSenhaError.textContent =
            "Confirme a nova senha.";

        formularioValido = false;

    } else if (novaSenha !== confirmacaoNovaSenha) {

        confirmarSenhaInput.classList.add("input-invalid");

        confirmarSenhaError.textContent =
            "A confirmação de senha não coincide.";

        formularioValido = false;

    } else {

        confirmarSenhaInput.classList.add("input-valid");
    }

    if (!formularioValido) {
        return;
    }

    const botao = resetForm.querySelector("button[type='submit']");
    botao.disabled = true;

    formMessage.textContent = "Alterando senha...";
    formMessage.classList.add("form-message--loading");

    try {

        const resposta = await fetch("/api/auth/redefinir-senha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                token,
                novaSenha,
                confirmacaoNovaSenha
            })
        });

        const dados = await resposta.json();

        if (dados.success) {

            formMessage.textContent = dados.message;
            formMessage.className =
                "form-message form-message--success";

            window.setTimeout(() => {
                window.location.href = "login.html?senha=alterada";
            }, 900);

        } else {

            formMessage.textContent =
                dados.message || "Não foi possível alterar a senha.";

            formMessage.className =
                "form-message form-message--error";

            botao.disabled = false;
        }

    } catch (erro) {

        console.error("Erro ao alterar senha:", erro);

        formMessage.textContent =
            "Não foi possível alterar a senha. Tente novamente.";

        formMessage.className =
            "form-message form-message--error";

        botao.disabled = false;
    }
});
