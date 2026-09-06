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

togglePassword.addEventListener(
    "click",
    () => {

        const mostrarSenha =
            senhaInput.type === "password";


        senhaInput.type =
            mostrarSenha
                ? "text"
                : "password";


        togglePassword.setAttribute(
            "aria-label",
            mostrarSenha
                ? "Ocultar senha"
                : "Mostrar senha"
        );


        togglePassword.setAttribute(
            "aria-pressed",
            String(mostrarSenha)
        );

    }
);


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


        // Executa a validação

        if (
            !validarLogin()
        ) {

            return;

        }


        /*
         * Nesta etapa o sistema ainda não possui
         * um Back-end implementado.
         *
         * Futuramente, esta área poderá realizar
         * uma requisição HTTP para o Controller
         * responsável pela autenticação.
         */

        formMessage.textContent =
            "Dados válidos. " +
            "A autenticação será implementada posteriormente.";

    }
);


/* =========================================================
   5. RECUPERAÇÃO DE SENHA
   ========================================================= */

forgotPassword.addEventListener(
    "click",
    (event) => {

        event.preventDefault();


        formMessage.textContent =
            "A recuperação de senha será implementada posteriormente.";

    }
);
