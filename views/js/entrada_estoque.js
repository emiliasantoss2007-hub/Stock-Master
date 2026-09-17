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
    const produtosLink = document.querySelector("#produtosLink");
    const usuariosLink = document.querySelector("#usuariosLink");
    const entradaLink = document.querySelector("#entradaLink");
    const saidaLink = document.querySelector("#saidaLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const historicoLink = document.querySelector("#historicoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");
    const perfilLink = document.querySelector("#perfilLink");
    const produtosMenuText = document.querySelector("#produtosMenuText");

    const userRole = document.querySelector("#userRole");
    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");


    // ========================================
    // ADMINISTRADOR
    // ========================================

    if (origem !== "tecnico") {

        dashboardLink.href = "dashboard_adm.html";
        breadcrumbLink.href = "dashboard_adm.html";
        produtosLink.href = "produtos.html?origem=adm";
        produtosMenuText.textContent = "Produtos";

        entradaLink.href = "entrada_estoque.html?origem=adm";
        saidaLink.href = "saída_estoque.html?origem=adm";
        expurgoLink.href = "expurgo_estoque.html?origem=adm";
        historicoLink.href = "historico_movimentacao.html?origem=adm";
        relatoriosLink.href = "relatorios.html?origem=adm";
        perfilLink.href = "perfil.html?origem=adm";

        userRole.textContent = "Administrador";
        username.textContent = "admin.stockmaster";
        userAvatar.textContent = "AD";

        usuariosLink.style.display = "";
        expurgoLink.style.display = "";
        relatoriosLink.style.display = "";
    }


    // ========================================
    // TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        dashboardLink.href = "dashboard_tec.html";
        breadcrumbLink.href = "dashboard_tec.html";
        produtosLink.href = "produtos.html?origem=tecnico";
        produtosMenuText.textContent = "Consultar produtos";

        entradaLink.href = "entrada_estoque.html?origem=tecnico";
        saidaLink.href = "saída_estoque.html?origem=tecnico";
        historicoLink.href = "historico_movimentacao.html?origem=tecnico";
        perfilLink.href = "perfil.html?origem=tecnico";

        userRole.textContent = "Técnico";
        username.textContent = "tecnico.stockmaster";
        userAvatar.textContent = "TC";

        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";
    }


    // ========================================
    // CÓDIGO ESPECÍFICO DA PÁGINA
    // ========================================

    const select = document.querySelector("#produtoSelect");
    const infoEstoque = document.querySelector("#infoEstoque");
    const mensagemArea = document.querySelector("#mensagemArea");

    const produtos = [
    {
        id: 1,
        nome: "Display LCD 6.1",
        sku: "SKU-001"
    },
    {
        id: 2,
        nome: "Bateria modelo A20",
        sku: "SKU-002"
    },
    {
        id: 3,
        nome: "Conector USB-C",
        sku: "SKU-003"
    }
];

produtos.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.nome} (SKU: ${p.sku})`;
    select.appendChild(opt);
});

    select.addEventListener("change", () => {
    const produto = produtos.find(
        (p) => String(p.id) === String(select.value)
    );

    infoEstoque.textContent = produto
        ? `Produto selecionado: ${produto.nome} (${produto.sku}).`
        : "";
});

    document.querySelector("#formEntrada").addEventListener("submit", (e) => {
    e.preventDefault();

    mensagemArea.innerHTML = "";

    const produtoId = select.value;
    const quantidade = Number(
        document.querySelector("#quantidade").value
    );

    if (!produtoId) {
        mensagemArea.innerHTML =
            `<p class="mensagem-erro">
                Selecione um produto para continuar.
            </p>`;
        return;
    }

    if (!quantidade || quantidade <= 0) {
        mensagemArea.innerHTML =
            `<p class="mensagem-erro">
                Informe uma quantidade maior que zero.
            </p>`;
        return;
    }

    const produto = produtos.find(
        (p) => String(p.id) === String(produtoId)
    );

    if (!produto) {
        mensagemArea.innerHTML =
            `<p class="mensagem-erro">
                Produto não encontrado.
            </p>`;
        return;
    }

    mensagemArea.innerHTML =
        `<p class="mensagem-sucesso">
            Entrada de ${quantidade} unidade(s) de
            "${produto.nome}" registrada com sucesso!
        </p>`;

    document.querySelector("#formEntrada").reset();
    infoEstoque.textContent = "";
});

});