document.addEventListener("DOMContentLoaded", () => {
    const recoveryForm = document.querySelector("#recoveryForm");
    const emailInput = document.querySelector("#email");
    const emailError = document.querySelector("#emailError");
    const formMessage = document.querySelector("#formMessage");

    // Verifica se os elementos necessários existem
    if (!recoveryForm || !emailInput || !emailError || !formMessage) {
        console.error(
            "Erro: elementos do formulário de recuperação de senha não foram encontrados."
        );
        return;
    }

    recoveryForm.addEventListener("submit", async (event) => {
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
});

