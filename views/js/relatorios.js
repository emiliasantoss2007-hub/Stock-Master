
document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // USUÁRIO E ACESSO
    // ========================================

    const usuarioLogado = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    if (
        !usuarioLogado ||
        Number(usuarioLogado.id_nivel_acesso) !== 1
    ) {
        window.location.href = "login.html";
        return;
    }

    const username = document.querySelector("#username");
    const userRole = document.querySelector("#userRole");
    const userAvatar = document.querySelector("#userAvatar");

    const nomeUsuario = usuarioLogado.nome || usuarioLogado.login || "Administrador";

    username.textContent = usuarioLogado.login || nomeUsuario;
    userRole.textContent = "Administrador";
    userAvatar.textContent = nomeUsuario
        .split(" ")
        .map((parte) => parte.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    // ========================================
    // NAVEGAÇÃO
    // ========================================

    const dashboardLink = document.querySelector("#dashboardLink");
    const breadcrumbLink = document.querySelector("#breadcrumbLink");

    dashboardLink.href = "dashboard_adm.html";
    breadcrumbLink.href = "dashboard_adm.html";

    // ========================================
    // ELEMENTOS
    // ========================================

    const formulario = document.querySelector("#formRelatorio");

    const filtroBusca = document.querySelector("#filtroBusca");
    const filtroCategoria = document.querySelector("#filtroCategoria");
    const apenasZerados = document.querySelector("#apenasZerados");

    const btnGerar = document.querySelector("#btnGerar");
    const btnImprimir = document.querySelector("#btnImprimir");

    const mensagemArea = document.querySelector("#mensagemArea");
    const resultadoArea = document.querySelector("#resultadoArea");

    const totalProdutos = document.querySelector("#totalProdutos");
    const totalUnidades = document.querySelector("#totalUnidades");
    const produtosZerados = document.querySelector("#produtosZerados");
    const valorTotal = document.querySelector("#valorTotal");

    const dataGeracao = document.querySelector("#dataGeracao");
    const quantidadeResultados = document.querySelector("#quantidadeResultados");
    const relatorioCorpo = document.querySelector("#relatorioCorpo");

    let relatorioAtual = null;

    // ========================================
    // FORMATAÇÃO
    // ========================================

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarData(data) {
        return new Date(data).toLocaleString("pt-BR");
    }

    function mostrarMensagem(mensagem, tipo = "erro") {
        mensagemArea.textContent = mensagem;
        mensagemArea.className = `mensagem-${tipo}`;
    }

    function limparMensagem() {
        mensagemArea.textContent = "";
        mensagemArea.className = "";
    }

    // ========================================
    // CABEÇALHO DA REQUISIÇÃO
    // ========================================

    function obterCabecalhos() {
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-User": JSON.stringify(usuarioLogado)
        };
    }

    // ========================================
    // GERAR RELATÓRIO
    // ========================================

    formulario.addEventListener("submit", async (event) => {

        event.preventDefault();

        limparMensagem();

        const busca = filtroBusca.value.trim();
        const categoria = filtroCategoria.value.trim();
        const somenteZerados = apenasZerados.checked;

        const parametros = new URLSearchParams();

        if (busca) {
            parametros.append("busca", busca);
        }

        if (categoria) {
            parametros.append("categoria", categoria);
        }

        if (somenteZerados) {
            parametros.append("apenasZerados", "true");
        }

        btnGerar.disabled = true;
        btnGerar.textContent = "Gerando...";

        resultadoArea.hidden = true;

        try {

            const response = await fetch(
                `/api/relatorios/estoque?${parametros.toString()}`,
                {
                    method: "GET",
                    headers: obterCabecalhos()
                }
            );

            const dadosResposta = await response.json();

            if (!response.ok || !dadosResposta.sucesso) {

                throw new Error(
                    dadosResposta.mensagem ||
                    "Não foi possível gerar o relatório."
                );
            }

            relatorioAtual = dadosResposta.dados;

            exibirRelatorio(relatorioAtual);

            mostrarMensagem(
                dadosResposta.mensagem || "Relatório gerado com sucesso.",
                "sucesso"
            );

        } catch (erro) {

            console.error("Erro ao gerar relatório:", erro);

            mostrarMensagem(
                erro.message ||
                "Erro de comunicação com o servidor."
            );

            resultadoArea.hidden = true;

        } finally {

            btnGerar.disabled = false;
            btnGerar.textContent = "Gerar relatório";

        }

    });

    // ========================================
    // EXIBIR RESULTADOS
    // ========================================

    function exibirRelatorio(relatorio) {

        const resumo = relatorio.resumo;
        const itens = relatorio.itens || [];

        totalProdutos.textContent = resumo.totalItens;
        totalUnidades.textContent = resumo.totalUnidades;
        produtosZerados.textContent = resumo.produtosZerados;

        valorTotal.textContent = formatarMoeda(
            resumo.valorTotalEstoque
        );

        dataGeracao.textContent =
            `Gerado em ${formatarData(relatorio.geradoEm)}`;

        quantidadeResultados.textContent =
            `${itens.length} produto(s) encontrado(s)`;

        relatorioCorpo.innerHTML = "";

        if (itens.length === 0) {

            const linha = document.createElement("tr");
            const coluna = document.createElement("td");

            coluna.colSpan = 6;
            coluna.textContent =
                "Nenhum produto encontrado com os filtros selecionados.";

            linha.appendChild(coluna);
            relatorioCorpo.appendChild(linha);

        } else {

            itens.forEach((produto) => {

                const linha = document.createElement("tr");

                const valores = [
                    produto.sku || "-",
                    produto.nome || "-",
                    produto.categoria || "-",
                    `${produto.quantidadeEstoque} un.`,
                    produto.valorUnitario === null
                        ? "-"
                        : formatarMoeda(produto.valorUnitario),
                    formatarMoeda(produto.valorEstoque)
                ];

                valores.forEach((valor, indice) => {

                    const coluna = document.createElement("td");
                    coluna.textContent = valor;

                    if (indice === 3 && produto.quantidadeEstoque === 0) {
                        coluna.classList.add("estoque-zerado");
                    }

                    linha.appendChild(coluna);

                });

                relatorioCorpo.appendChild(linha);

            });

        }

        resultadoArea.hidden = false;

    }

    // ========================================
    // LIMPAR FILTROS
    // ========================================

    formulario.addEventListener("reset", () => {

        limparMensagem();

        resultadoArea.hidden = true;

        relatorioAtual = null;

    });

    // ========================================
    // IMPRIMIR RELATÓRIO
    // ========================================

    btnImprimir.addEventListener("click", () => {

        if (!relatorioAtual) {
            mostrarMensagem("Gere um relatório antes de imprimir.");
            return;
        }

        window.print();

    });

});
