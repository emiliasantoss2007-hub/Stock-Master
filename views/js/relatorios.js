
document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    const formulario = document.querySelector("#formRelatorio");
    const busca = document.querySelector("#busca");
    const categoria = document.querySelector("#categoria");
    const apenasZerados = document.querySelector("#apenasZerados");
    const mensagemArea = document.querySelector("#mensagemArea");
    const btnGerar = formulario.querySelector('button[type="submit"]');
    const resultadoArea = document.querySelector("#resultadoArea");
    const corpoRelatorio = document.querySelector("#relatorioCorpo");
    const btnImprimir = document.querySelector("#btnImprimir");

    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");

    if (!usuario || Number(usuario.id_nivel_acesso) !== 1) {
        window.location.href = "login.html";
        return;
    }

    username.textContent = usuario.nome || usuario.login || "Administrador";
    userAvatar.textContent = (usuario.nome || "AD")
        .substring(0, 2)
        .toUpperCase();

    function mostrarMensagem(texto, tipo) {
        mensagemArea.innerHTML = "";
        const mensagem = document.createElement("p");

        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : "mensagem-erro";

        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarData(data) {
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    }

    function exibirRelatorio(relatorio) {
        const resumo = relatorio.resumo;
        const itens = relatorio.itens;

        document.querySelector("#relatorioTitulo").textContent =
            "Relatório de Estoque";

        document.querySelector("#dataGeracao").textContent =
            formatarData(relatorio.geradoEm);

        document.querySelector("#quantidadeResultados").textContent =
            `${itens.length} produto(s) encontrado(s)`;

        document.querySelector("#totalProdutos").textContent =
            resumo.totalItens;

        document.querySelector("#totalUnidades").textContent =
            resumo.totalUnidades;

        document.querySelector("#produtosZerados").textContent =
            resumo.produtosZerados;

        document.querySelector("#valorTotal").textContent =
            formatarMoeda(resumo.valorTotalEstoque);

        corpoRelatorio.innerHTML = "";

        if (itens.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 6;
            celula.textContent =
                "Nenhum produto encontrado para os filtros informados.";

            linha.appendChild(celula);
            corpoRelatorio.appendChild(linha);
        } else {
            itens.forEach((item) => {
                const linha = document.createElement("tr");

                const valores = [
                    item.sku,
                    item.nome,
                    item.categoria,
                    item.quantidadeEstoque,
                    item.valorUnitario == null
                        ? "-"
                        : formatarMoeda(item.valorUnitario),
                    formatarMoeda(item.valorEstoque)
                ];

                valores.forEach((valor) => {
                    const celula = document.createElement("td");

                    celula.textContent =
                        valor == null ? "-" : valor;

                    linha.appendChild(celula);
                });

                corpoRelatorio.appendChild(linha);
            });
        }

        resultadoArea.style.display = "block";
    }

    // SOLICITAR RELATÓRIO
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        mensagemArea.innerHTML = "";
        btnGerar.disabled = true;
        btnGerar.textContent = "Gerando relatório...";

        const filtros = {
            busca: busca.value.trim(),
            categoria: categoria.value.trim(),
            apenasZerados: apenasZerados.checked
        };

        const parametros = new URLSearchParams({
            busca: filtros.busca,
            categoria: filtros.categoria,
            apenasZerados: String(filtros.apenasZerados)
        });

        try {
            const resposta = await fetch(
                `/api/relatorios/estoque?${parametros.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "X-User": JSON.stringify(usuario)
                    }
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível gerar o relatório."
                );
            }

            if (
                !resultado.dados ||
                !resultado.dados.resumo ||
                !Array.isArray(resultado.dados.itens)
            ) {
                throw new Error("O servidor retornou dados inválidos.");
            }

            exibirRelatorio(resultado.dados);
            mostrarMensagem(resultado.mensagem, "sucesso");

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
        resultadoArea.style.display = "none";
        corpoRelatorio.innerHTML = "";
    });

    // IMPRIMIR RELATÓRIO
    btnImprimir.addEventListener("click", () => {
        window.print();
    });
});
