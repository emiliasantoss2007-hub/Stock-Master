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

    const searchInput =
        document.querySelector("#searchProduct");

    const categoryFilter =
        document.querySelector("#filterCategory");

    const situationFilter =
        document.querySelector("#filterSituation");

    const rows = Array.from(
        document.querySelectorAll("#productsTableBody tr")
    );

    const productsCount =
        document.querySelector("#productsCount");

    const productsMessage =
        document.querySelector("#productsMessage");


    function filterProducts() {

        const search =
            searchInput.value.trim().toLowerCase();

        const category =
            categoryFilter.value;

        const situation =
            situationFilter.value;

        let visibleRows = 0;

        rows.forEach((row) => {

            const matchesSearch =
                !search ||
                row.dataset.search.includes(search);

            const matchesCategory =
                !category ||
                row.dataset.category === category;

            const matchesSituation =
                !situation ||
                row.dataset.situation === situation;

            const shouldShow =
                matchesSearch &&
                matchesCategory &&
                matchesSituation;

            row.hidden = !shouldShow;

            if (shouldShow) {
                visibleRows++;
            }
        });

        productsCount.textContent =
            `${visibleRows} produto(s)`;

        productsMessage.textContent =
            visibleRows === 0
                ? "Nenhum produto encontrado para os filtros informados."
                : "";
    }


    searchInput.addEventListener(
        "input",
        filterProducts
    );

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

    situationFilter.addEventListener(
        "change",
        filterProducts
    );

});