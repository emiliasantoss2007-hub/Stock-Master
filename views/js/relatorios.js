
document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    const formulario = document.querySelector("#formRelatorio");
    const busca = document.querySelector("#filtroBusca");
    const categoria = document.querySelector("#filtroCategoria");
    const apenasZerados = document.querySelector("#apenasZerados");
    const mensagemArea = document.querySelector("#mensagemArea");
    const btnGerar = document.querySelector("#btnGerar");

    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");

    if (
        !usuario ||
        Number(usuario.id_nivel_acesso) !== 1
    ) {
        window.location.href = "login.html";
        return;
    }

    username.textContent = usuario.nome || usuario.login || "Administrador";
    userAvatar.textContent = (
        usuario.nome || "AD"
    ).substring(0, 2).toUpperCase();

    function obterCabecalhos() {
        return {
            "Content-Type": "application/json",
            "X-User": JSON.stringify(usuario)
        };
    }

    function mostrarMensagem(texto, tipo) {
        mensagemArea.innerHTML = "";

        const mensagem = document.createElement("p");

        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : "mensagem-erro";

        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    // CARREGAR CATEGORIAS
    async function carregarCategorias() {
        try {
            const resposta = await fetch(
                "/api/produtos/entrada/listar",
                { headers: obterCabecalhos() }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(
                    resultado.mensagem || "Erro ao carregar categorias."
                );
            }

            const categorias = [
                ...new Set(
                    resultado.produtos
                        .map(produto => produto.categoria)
                        .filter(Boolean)
                )
            ].sort();

            categorias.forEach(nome => {
                const opcao = document.createElement("option");

                opcao.value = nome;
                opcao.textContent = nome;

                categoria.appendChild(opcao);
            });

        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    }

    // SOLICITAR RELATÓRIO
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        mensagemArea.innerHTML = "";
        btnGerar.disabled = true;
        btnGerar.textContent = "Gerando relatório...";

        try {
            const filtros = {
                busca: busca.value.trim(),
                categoria: categoria.value,
                apenasZerados: apenasZerados.checked
            };

            const parametros = new URLSearchParams();

            parametros.set("busca", filtros.busca);
            parametros.set("categoria", filtros.categoria);
            parametros.set(
                "apenasZerados",
                String(filtros.apenasZerados)
            );

            const resposta = await fetch(
                `/api/relatorios/estoque?${parametros.toString()}`,
                {
                    method: "GET",
                    headers: obterCabecalhos()
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(
                    resultado.mensagem || "Não foi possível gerar o relatório."
                );
            }

            if (!resultado.dados || !Array.isArray(resultado.dados.itens)) {
                throw new Error("O servidor retornou dados inválidos.");
            }

            // GUARDAR RESULTADO PARA VISUALIZAÇÃO
            sessionStorage.setItem(
                "relatorioEstoque",
                JSON.stringify({
                    filtros,
                    dados: resultado.dados,
                    desempenho: resultado.desempenho
                })
            );

            mostrarMensagem(
                resultado.mensagem,
                "sucesso"
            );

            // ENCAMINHAR PARA VISUALIZAÇÃO
            window.location.href =
                "visualizar_relatorios.html?origem=adm";

        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        } finally {
            btnGerar.disabled = false;
            btnGerar.textContent = "Gerar relatório";
        }
    });

    // LIMPAR FILTROS
    formulario.addEventListener("reset", () => {
        mensagemArea.innerHTML = "";
        sessionStorage.removeItem("relatorioEstoque");
    });

    carregarCategorias();
});
