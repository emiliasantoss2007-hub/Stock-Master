document.addEventListener("DOMContentLoaded", () => {
    const recoveryForm = document.querySelector("#recoveryForm");
    const emailInput = document.querySelector("#email");
    const emailError = document.querySelector("#emailError");
    const formMessage = document.querySelector("#formMessage");

    // Verificação para identificar erro de ID ou carregamento incompleto.
    if (!recoveryForm || !emailInput || !emailError || !formMessage) {
        console.error("Erro: elementos da tela de recuperação não foram encontrados.");
        return;
    }

    recoveryForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        emailInput.classList.remove("input-invalid", "input-valid");
        emailError.textContent = "";
        formMessage.textContent = "";
        formMessage.className = "form-message";

        if (email === "") {
            emailInput.classList.add("input-invalid");
            emailError.textContent = "Informe o e-mail cadastrado.";
            return;
        }

        if (!emailValido) {
            emailInput.classList.add("input-invalid");
            emailError.textContent = "Informe um e-mail válido, como usuario@exemplo.com.";
            return;
        }

        emailInput.classList.add("input-valid");
        formMessage.textContent = "E-mail validado. Continuando para a redefinição...";
        formMessage.classList.add("form-message--success");

        /*
          CONEXÃO JS ENTRE TELAS:
          views/html/recuperar-senha.html
          -> views/html/redefinir-senha.html
        */
        window.setTimeout(() => {
            window.location.href = "redefinir_senha.html?email=" + encodeURIComponent(email);
        }, 900);
    });
});
