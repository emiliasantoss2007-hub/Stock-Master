
document.addEventListener("DOMContentLoaded", async () => {
    const navegacao = await configurarNavegacaoDaSessao();

    if (!navegacao) return;

    const formularioDados = document.querySelector("#formDados");
    const formularioSenha = document.querySelector("#formSenha");

    const mensagemDados = document.querySelector("#mensagemDados");
    const mensagemSenha = document.querySelector("#mensagemSenha");

    const campoNome = document.querySelector("#perfilNome");
    const campoEmail = document.querySelector("#perfilEmail");
    const campoLogin = document.querySelector("#perfilLoginCampo");
    const campoPerfil = document.querySelector("#perfilTipo");

    function mostrarMensagem(elemento, mensagem, sucesso = false) {
        elemento.replaceChildren();

        const paragrafo = document.createElement("p");
        paragrafo.className = sucesso ? "mensagem-sucesso" : "mensagem-erro";
        paragrafo.textContent = mensagem;

        elemento.appendChild(paragrafo);
    }

    async function requisicao(url, metodo, dados) {
        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                resultado.message ||
                "Não foi possível concluir a operação."
            );
        }

        return resultado;
    }

    async function carregarPerfil() {
        try {
            const resposta = await fetch("/usuarios/me", {
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (resposta.status === 401) {
                window.location.replace("login.html");
                return false;
            }

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Não foi possível carregar o perfil."
                );
            }

            campoNome.value = dados.nome || "";
            campoEmail.value = dados.email || "";
            campoLogin.value = dados.login || "";
            campoPerfil.value = dados.perfil || "";

            const userRole = document.querySelector("#userRole");

            if (userRole) {
                userRole.textContent = dados.perfil || "Usuário";
            }

            return true;

        } catch (erro) {
            mostrarMensagem(mensagemDados, erro.message);
            return false;
        }
    }

    formularioDados.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagemDados.replaceChildren();

        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim();

        if (!nome || !email) {
            mostrarMensagem(
                mensagemDados,
                "Preencha corretamente o nome e o e-mail."
            );
            return;
        }

        try {
            const resultado = await requisicao(
                "/usuarios/me",
                "PUT",
                { nome, email }
            );

            mostrarMensagem(
                mensagemDados,
                resultado.mensagem || "Dados atualizados com sucesso.",
                true
            );

            const avatar = document.querySelector("#userAvatar, .avatar");

            if (avatar) {
                avatar.textContent = nome
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(parte => parte.charAt(0))
                    .join("")
                    .toUpperCase();
            }

        } catch (erro) {
            mostrarMensagem(mensagemDados, erro.message);
        }
    });

    formularioSenha.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagemSenha.replaceChildren();

        const senhaAtual = document.querySelector("#senhaAtual").value;
        const novaSenha = document.querySelector("#senhaNova").value;
        const confirmarSenha = document.querySelector("#senhaConfirmar").value;

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            mostrarMensagem(
                mensagemSenha,
                "Preencha todos os campos de senha."
            );
            return;
        }

        if (novaSenha !== confirmarSenha) {
            mostrarMensagem(
                mensagemSenha,
                "A confirmação da senha não confere."
            );
            return;
        }

        try {
            const resultado = await requisicao(
                "/usuarios/me/senha",
                "PUT",
                {
                    senhaAtual,
                    novaSenha,
                    confirmarSenha
                }
            );

            mostrarMensagem(
                mensagemSenha,
                resultado.mensagem || "Senha alterada com sucesso.",
                true
            );

            formularioSenha.reset();

        } catch (erro) {
            mostrarMensagem(mensagemSenha, erro.message);
        }
    });

    await carregarPerfil();

    // Mostrar / ocultar senhas
    document.querySelectorAll(".password-wrapper").forEach((wrapper) => {
        const campo = wrapper.querySelector("input");
        const botao = wrapper.querySelector(".password-toggle");

        botao.addEventListener("click", () => {
            const mostrar = campo.type === "password";

            campo.type = mostrar ? "text" : "password";

            botao.setAttribute(
                "aria-label",
                mostrar ? "Ocultar senha" : "Mostrar senha"
            );

            botao.setAttribute(
                "aria-pressed",
                String(mostrar)
            );
        });
    });
});