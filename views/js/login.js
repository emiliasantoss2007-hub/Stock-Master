/* =========================================================
   STOCK MASTER - LOGIN
   Integração com API de autenticação
   ========================================================= */

"use strict";


/* =========================================================
   1. ELEMENTOS DO DOM
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");

const usuarioInput =
    document.getElementById("usuario");

const senhaInput =
    document.getElementById("senha");

const togglePassword =
    document.getElementById("togglePassword");

const usuarioError =
    document.getElementById("usuarioError");

const senhaError =
    document.getElementById("senhaError");

const formMessage =
    document.getElementById("formMessage");

const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================================
   2. MOSTRAR / OCULTAR SENHA
   ========================================================= */

togglePassword.addEventListener("click", () => {
togglePassword.addEventListener("click", () => {

    if (senhaInput.type === "password") {

        senhaInput.type = "text";
    if (senhaInput.type === "password") {

        senhaInput.type = "text";

        togglePassword.setAttribute(
            "aria-label",
            "Ocultar senha"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            "true"
        );

    } else {

        senhaInput.type = "password";

        togglePassword.setAttribute(
            "aria-label",
            "Mostrar senha"
            "Ocultar senha"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            "true"
        );

    } else {

        senhaInput.type = "password";

        togglePassword.setAttribute(
            "aria-label",
            "Mostrar senha"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            "false"
            "false"
        );

    }

});

});


/* =========================================================
   3. VALIDAÇÃO DO LOGIN
   ========================================================= */

function validarLogin() {

    let valido = true;

    usuarioError.textContent = "";
    senhaError.textContent = "";
    formMessage.textContent = "";

    if (usuarioInput.value.trim() === "") {

        usuarioError.textContent =
            "Informe o usuário.";

        valido = false;
    }

    if (senhaInput.value.trim() === "") {

        senhaError.textContent =
            "Informe a senha.";

        valido = false;
    }

    return valido;
}


/* =========================================================
   4. ENVIO DO FORMULÁRIO
   ========================================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (!validarLogin()) {
            return;
        }

        const login =
            usuarioInput.value.trim();

        const senha =
            senhaInput.value;

        formMessage.textContent =
            "Autenticando...";

        try {

            const resposta = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        login,
                        senha
                    })
                }
            );

            const resultado =
                await resposta.json();

            /* ---------- Login realizado ---------- */

            if (resultado.success) {

                const perfil =
                    resultado.data.perfil;

                if (perfil.id === 1) {

                    window.location.href =
                        "/html/dashboard_adm.html";

                    return;
                }

                if (perfil.id === 2) {

                    window.location.href =
                        "/html/dashboard_tec.html";

                    return;
                }

                formMessage.textContent =
                    "Perfil de usuário não reconhecido.";

                return;
            }


            /* ---------- Login bloqueado ---------- */

            if (resultado.code === "ACCOUNT_LOCKED") {

                formMessage.textContent =
                    resultado.message;

                return;
            }


            /* ---------- Usuário inativo ---------- */

            if (resultado.code === "USER_INACTIVE") {

                formMessage.textContent =
                    resultado.message;

                return;
            }


            /* ---------- Credenciais inválidas ---------- */

            formMessage.textContent =
                resultado.message ||
                "Usuário ou senha inválidos.";
        // Executa a validação dos campos
        if (!validarLogin()) {
            return;
        }

        const login =
            usuarioInput.value.trim();

        const senha =
            senhaInput.value;

        formMessage.textContent =
            "Autenticando...";

        try {

            const resposta = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        login,
                        senha
                    })
                }
            );

            const resultado =
                await resposta.json();

            /* ---------- Login realizado ---------- */

            if (resultado.success) {

                const perfil =
                    resultado.data.perfil;

                if (perfil.id === 1) {

                    window.location.href =
                        "/html/dashboard_adm.html";

                    return;
                }

                if (perfil.id === 2) {

                    window.location.href =
                        "/html/dashboard_tec.html";

                    return;
                }

                formMessage.textContent =
                    "Perfil de usuário não reconhecido.";

                return;
            }


            /* ---------- Login bloqueado ---------- */

            if (resultado.code === "ACCOUNT_LOCKED") {

                formMessage.textContent =
                    resultado.message;

                return;
            }


            /* ---------- Usuário inativo ---------- */

            if (resultado.code === "USER_INACTIVE") {

                formMessage.textContent =
                    resultado.message;

                return;
            }


            /* ---------- Credenciais inválidas ---------- */

            formMessage.textContent =
                resultado.message ||
                "Usuário ou senha inválidos.";

        } catch (erro) {

            console.error(
                "[StockMaster] Erro ao realizar login:",
                erro
            );

            formMessage.textContent =
                "Não foi possível conectar ao servidor. Tente novamente.";
        }

    }
);
