const resetForm = document.querySelector("#resetForm");
const novaSenhaInput = document.querySelector("#novaSenha");
const confirmarSenhaInput = document.querySelector("#confirmarSenha");
const novaSenhaError = document.querySelector("#novaSenhaError");
const confirmarSenhaError = document.querySelector("#confirmarSenhaError");
const formMessage = document.querySelector("#formMessage");

resetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const novaSenha = novaSenhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;
    let formularioValido = true;

    novaSenhaInput.classList.remove("input-invalid", "input-valid");
    confirmarSenhaInput.classList.remove("input-invalid", "input-valid");
    novaSenhaError.textContent = "";
    confirmarSenhaError.textContent = "";
    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (novaSenha.length < 8) {
        novaSenhaInput.classList.add("input-invalid");
        novaSenhaError.textContent = "A senha deve possuir pelo menos 8 caracteres.";
        formularioValido = false;
    } else {
        novaSenhaInput.classList.add("input-valid");
    }

    if (!confirmarSenha) {
        confirmarSenhaInput.classList.add("input-invalid");
        confirmarSenhaError.textContent = "Confirme a nova senha.";
        formularioValido = false;
    } else if (novaSenha !== confirmarSenha) {
        confirmarSenhaInput.classList.add("input-invalid");
        confirmarSenhaError.textContent = "A confirmação de senha não coincide.";
        formularioValido = false;
    } else {
        confirmarSenhaInput.classList.add("input-valid");
    }

    if (!formularioValido) {
        return;
    }

    formMessage.textContent = "Senha redefinida com sucesso. Retornando ao login...";
    formMessage.classList.add("form-message--success");

    /* CONEXÃO JS: redefinir-senha.html -> login.html */
    window.setTimeout(() => {
        window.location.href = "login.html?senha=alterada";
    }, 900);
});
