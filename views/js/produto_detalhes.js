document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // IDENTIFICAÇÃO DA ORIGEM
    // ========================================

    const params = new URLSearchParams(
        window.location.search
    );

    const origem = params.get("origem");

    const idProduto =
        params.get("id") || "1";


    // ========================================
    // ELEMENTOS DA NAVEGAÇÃO
    // ========================================

    const dashboardLink =
        document.querySelector("#dashboardLink");

    const breadcrumbLink =
        document.querySelector("#breadcrumbLink");

    const breadcrumbProdutosLink =
        document.querySelector("#breadcrumbProdutosLink");

    const produtosLink =
        document.querySelector("#produtosLink");

    const voltarProdutosLink =
        document.querySelector("#voltarProdutosLink");

    const editarProdutoLink =
        document.querySelector("#editarProdutoLink");

    const usuariosLink =
        document.querySelector("#usuariosLink");

    const expurgoLink =
        document.querySelector("#expurgoLink");

    const relatoriosLink =
        document.querySelector("#relatoriosLink");

    const produtosMenuText =
        document.querySelector("#produtosMenuText");

    const userRole =
        document.querySelector("#userRole");

    const username =
        document.querySelector("#username");

    const userAvatar =
        document.querySelector("#userAvatar");


    // ========================================
    // ADMINISTRADOR
    // ========================================

    if (origem !== "tecnico") {

        dashboardLink.href =
            "dashboard_adm.html";

        breadcrumbLink.href =
            "dashboard_adm.html";

        produtosLink.href =
            "produtos.html?origem=adm";

        breadcrumbProdutosLink.href =
            "produtos.html?origem=adm";

        voltarProdutosLink.href =
            "produtos.html?origem=adm";

        editarProdutoLink.href =
            `editar_produto.html?id=${idProduto}&origem=adm`;

        produtosMenuText.textContent =
            "Produtos";

        userRole.textContent =
            "Administrador";

        username.textContent =
            "admin.stockmaster";

        userAvatar.textContent =
            "AD";

        usuariosLink.style.display =
            "";

        expurgoLink.style.display =
            "";

        relatoriosLink.style.display =
            "";

    }


    // ========================================
    // TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        dashboardLink.href =
            "dashboard_tec.html";

        breadcrumbLink.href =
            "dashboard_tec.html";

        produtosLink.href =
            "produtos.html?origem=tecnico";

        breadcrumbProdutosLink.href =
            "produtos.html?origem=tecnico";

        voltarProdutosLink.href =
            "produtos.html?origem=tecnico";

        editarProdutoLink.href =
            `editar_produto.html?id=${idProduto}&origem=tecnico`;

        produtosMenuText.textContent =
            "Consultar produtos";

        userRole.textContent =
            "Técnico";

        username.textContent =
            "tecnico.stockmaster";

        userAvatar.textContent =
            "TC";


        // Esconde funções exclusivas do administrador

        usuariosLink.style.display =
            "none";

        expurgoLink.style.display =
            "none";

        relatoriosLink.style.display =
            "none";

    }

});