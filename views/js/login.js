/* =========================================================
   STOCK MASTER - ESTRUTURA BASE DO FRONT-END
   script.js
   ========================================================= */


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
        );

        togglePassword.setAttribute(
            "aria-pressed",
            "false"
        );

    }

});


/* =========================================================
   3. VALIDAÇÃO DO LOGIN
   ========================================================= */

function validarLogin() {

    let valido = true;


    // Limpa mensagens anteriores

    usuarioError.textContent = "";

    senhaError.textContent = "";

    formMessage.textContent = "";


    // Validação do usuário

    if (
        usuarioInput.value.trim() === ""
    ) {

        usuarioError.textContent =
            "Informe o usuário.";

        valido = false;

    }


    // Validação da senha

    if (
        senhaInput.value.trim() === ""
    ) {

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
    (event) => {

        // Impede o recarregamento da página
        event.preventDefault();

        // Executa a validação dos campos
        if (!validarLogin()) {
            return;
        }

        // Usuários fictícios para o protótipo
        const usuarios = {
            "administrador@gmail.com": {
                senha: "12345678",
                perfil: "adm",
                destino: "dashboard_adm.html"
            },

            "tecnico@gmail.com": {
                senha: "12345678",
                perfil: "tecnico",
                destino: "dashboard_tec.html"
            }
        };

        const usuario =
            usuarioInput.value.trim().toLowerCase();

        const senha =
            senhaInput.value.trim();

        const usuarioEncontrado =
            usuarios[usuario];

        // Verifica usuário e senha
        if (
            !usuarioEncontrado ||
            usuarioEncontrado.senha !== senha
        ) {

            formMessage.textContent =
                "Usuário ou senha inválidos.";

            return;
        }

        // Redireciona para o dashboard correspondente
        window.location.href =
            usuarioEncontrado.destino;
    }
);

         /*
         * Nesta etapa o sistema ainda não possui
         * um Back-end implementado.
         *
         * Futuramente, esta área poderá realizar
         * uma requisição HTTP para o Controller
         * responsável pela autenticação.
         */