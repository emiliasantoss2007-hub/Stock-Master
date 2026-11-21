document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // IDENTIFICAÇÃO DA ORIGEM
    // ========================================

    const params = new URLSearchParams(window.location.search);
    const origem = params.get("origem");


    // ========================================
    // ELEMENTOS DA NAVEGAÇÃO
    // ========================================

    const dashboardLink = document.querySelector("#dashboardLink");
    const breadcrumbLink = document.querySelector("#breadcrumbLink");

    const cadastrarProdutoLink = document.querySelector("#cadastrarProdutoLink");

    const usuariosLink = document.querySelector("#usuariosLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");

    const entradaLink = document.querySelector("#entradaLink");
    const saidaLink = document.querySelector("#saidaLink");
    const historicoLink = document.querySelector("#historicoLink");

    const produtosMenuText =
        document.querySelector("#produtosMenuText");

    const breadcrumbPage =
        document.querySelector("#breadcrumbPage");

    const userRole =
        document.querySelector("#userRole");

    const username =
        document.querySelector("#username");


    // ========================================
    // CONFIGURAÇÃO DO ADMINISTRADOR
    // ========================================

    if (origem !== "tecnico") {

        dashboardLink.href = "dashboard_adm.html";
        breadcrumbLink.href = "dashboard_adm.html";

        cadastrarProdutoLink.href = "cadastrar_produto.html?origem=adm";
        entradaLink.href = "entrada_estoque.html?origem=adm";

        userRole.textContent = "Administrador";
        username.textContent = "admin.stockmaster";

        produtosMenuText.textContent = "Produtos";
        breadcrumbPage.textContent = "Produtos";

        usuariosLink.style.display = "";
        expurgoLink.style.display = "";
        relatoriosLink.style.display = "";
    }


    // ========================================
    // CONFIGURAÇÃO DO TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        dashboardLink.href = "dashboard_tec.html";
        breadcrumbLink.href = "dashboard_tec.html";

        cadastrarProdutoLink.href = "cadastrar_produto.html?origem=tecnico";
        entradaLink.href = "entrada_estoque.html?origem=tecnico";

        userRole.textContent = "Técnico";
        username.textContent = "tecnico.stockmaster";

        produtosMenuText.textContent = "Consultar produtos";
        breadcrumbPage.textContent = "Produtos";

        // Esconde funções exclusivas do administrador
        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";
    }


    // ========================================
    // MANTER ORIGEM NO EDITAR
    // ========================================

    const editLinks =
        document.querySelectorAll(".product-action-edit");

    editLinks.forEach((link) => {

        const productId =
            new URLSearchParams(link.search).get("id");

        link.href = origem === "tecnico"
            ? `editar_produto.html?id=${productId}&origem=tecnico`
            : `editar_produto.html?id=${productId}&origem=adm`;
    });


    // ========================================
    // MANTER ORIGEM NOS DETALHES
    // ========================================

    const detailLinks =
        document.querySelectorAll(".product-action-view");

    detailLinks.forEach((link) => {

        const productId =
            new URLSearchParams(link.search).get("id");

        link.href = origem === "tecnico"
            ? `produto_detalhes.html?id=${productId}&origem=tecnico`
            : `produto_detalhes.html?id=${productId}&origem=adm`;
    });

    // ========================================
    // BUSCA E FILTROS DE PRODUTOS
    // ========================================

    const searchInput = document.querySelector("#searchProduct");
    const categoryFilter = document.querySelector("#filterCategory");
    const situationFilter = document.querySelector("#filterSituation");
    const tabelaProdutos = document.querySelector("#productsTableBody");

    const productsCount = document.querySelector("#productsCount");
    const productsMessage = document.querySelector("#productsMessage");

    let produtos = [];
    let temporizadorBusca;

    // SITUAÇÃO DO ESTOQUE
    function obterSituacao(produto) {
        return Number(produto.quantidadeEstoque) <= Number(produto.estoqueMinimo)
            ? "Crítico"
            : "Normal";
    }

    // MONTAGEM DA TABELA
    function preencherTabela(lista) {
        tabelaProdutos.innerHTML = "";

        lista.forEach((produto) => {
            const linha = document.createElement("tr");
            const situacao = obterSituacao(produto);

            const nome = document.createElement("strong");
            nome.textContent = produto.nome;

            const descricao = document.createElement("small");
            descricao.textContent = produto.descricao || "Sem descrição";

            const identificacao = document.createElement("div");
            identificacao.className = "product-cell";

            const miniatura = document.createElement("span");
            miniatura.className = "product-thumb";
            miniatura.textContent = "▣";

            const detalhes = document.createElement("div");
            detalhes.append(nome, descricao);
            identificacao.append(miniatura, detalhes);

            const celulaProduto = document.createElement("td");
            celulaProduto.append(identificacao);

            const celulaSku = document.createElement("td");
            celulaSku.textContent = produto.sku;

            const celulaCategoria = document.createElement("td");
            celulaCategoria.textContent = produto.categoria;

            const celulaSaldo = document.createElement("td");
            const saldo = document.createElement("span");
            saldo.className = "stock-value";
            saldo.textContent = `${produto.quantidadeEstoque} un.`;
            celulaSaldo.append(saldo);

            const celulaSituacao = document.createElement("td");
            const status = document.createElement("span");

            status.className = situacao === "Crítico"
                ? "status status-warning"
                : "status status-success";

            status.textContent = situacao === "Crítico"
                ? "Estoque crítico"
                : "Normal";

            celulaSituacao.append(status);

            const celulaAcoes = document.createElement("td");
            const acoes = document.createElement("div");
            acoes.className = "product-table-actions";

            const editar = document.createElement("a");
            editar.className = "product-action product-action-edit";
            editar.textContent = "Editar";

            editar.href = origem === "tecnico"
                ? `editar_produto.html?id=${produto.idProduto}&origem=tecnico`
                : `editar_produto.html?id=${produto.idProduto}&origem=adm`;

            const visualizar = document.createElement("a");
            visualizar.className = "product-action product-action-view";
            visualizar.textContent = "Detalhes";

            visualizar.href = origem === "tecnico"
                ? `produto_detalhes.html?id=${produto.idProduto}&origem=tecnico`
                : `produto_detalhes.html?id=${produto.idProduto}&origem=adm`;

            acoes.append(editar, visualizar);
            celulaAcoes.append(acoes);

            linha.append(
                celulaProduto,
                celulaSku,
                celulaCategoria,
                celulaSaldo,
                celulaSituacao,
                celulaAcoes
            );

            tabelaProdutos.append(linha);
        });

        productsCount.textContent = `${lista.length} produto(s)`;
    }

    // CONSULTA À API
    async function consultarProdutos() {
        const nome = searchInput.value.trim();
        const categoria = categoryFilter.value;

        const parametros = new URLSearchParams();

        if (nome) parametros.set("nome", nome);
        if (categoria) parametros.set("categoria", categoria);

        productsMessage.textContent = "Consultando produtos...";
        tabelaProdutos.innerHTML = "";
        productsCount.textContent = "Consultando...";

        try {
            const resposta = await fetch(
                `/api/produtos/consulta?${parametros.toString()}`
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.success) {
                throw new Error(
                    resultado.message || "Erro ao consultar produtos."
                );
            }

            produtos = resultado.data.produtos || [];

            aplicarFiltroSituacao();

        } catch (erro) {
            console.error("Erro na consulta:", erro);

            tabelaProdutos.innerHTML = "";
            productsCount.textContent = "0 produto(s)";
            productsMessage.textContent =
                "Não foi possível consultar os produtos. Tente novamente.";
        }
    }

    // FILTRO DE SITUAÇÃO
    function aplicarFiltroSituacao() {
        const situacaoSelecionada = situationFilter.value;

        const produtosFiltrados = produtos.filter((produto) => {
            return !situacaoSelecionada ||
                obterSituacao(produto) === situacaoSelecionada;
        });

        preencherTabela(produtosFiltrados);

        productsMessage.textContent = produtosFiltrados.length === 0
            ? "Nenhum produto encontrado para os filtros informados."
            : "";
    }

    // EVENTOS DOS FILTROS
    searchInput.addEventListener("input", () => {
        clearTimeout(temporizadorBusca);
        temporizadorBusca = setTimeout(consultarProdutos, 300);
    });

    categoryFilter.addEventListener("change", consultarProdutos);
    situationFilter.addEventListener("change", aplicarFiltroSituacao);

    // CONSULTA INICIAL
    consultarProdutos();

});