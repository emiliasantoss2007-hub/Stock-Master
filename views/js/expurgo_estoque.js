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
    // TÉCNICO (sem acesso a esta tela)
    // ========================================

    if (origem === "tecnico") {
        // Expurgo é exclusivo do Administrador — redireciona o Técnico
        window.location.href = "dashboard_tec.html";
        return;
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
        sku: "SKU-001",
        quantidade: 32
    },
    {
        id: 2,
        nome: "Bateria modelo A20",
        sku: "SKU-002",
        quantidade: 45
    },
    {
        id: 3,
        nome: "Conector USB-C",
        sku: "SKU-003",
        quantidade: 3
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
        ? `Estoque disponível: ${produto.quantidade} unidade(s).`
        : "";
});

    document.querySelector("#formExpurgo").addEventListener("submit", (e) => {
        e.preventDefault();
        mensagemArea.innerHTML = "";

        const produtoId = select.value;
        const quantidade = Number(document.querySelector("#quantidade").value);
        const justificativa = document.querySelector("#justificativa").value.trim();

        if (!produtoId) {
            mensagemArea.innerHTML = `<p class="mensagem-erro">Selecione um produto para continuar.</p>`;
            return;
        }

        const produto = produtos.find(
    (p) => String(p.id) === String(produtoId)
);

        if (!quantidade || quantidade <= 0 || quantidade > produto.quantidade) {
            mensagemArea.innerHTML = `<p class="mensagem-erro">Informe uma quantidade válida (disponível: ${produto.quantidade}).</p>`;
            return;
        }

        // RN12: expurgo exige justificativa obrigatória
        if (!justificativa) {
            mensagemArea.innerHTML = `<p class="mensagem-erro">A justificativa é obrigatória para o expurgo.</p>`;
            return;
        }

        const overlay = document.querySelector("#modalOverlay");
        document.querySelector("#modalTitulo").textContent = "Confirmar expurgo";
        document.querySelector("#modalMensagem").textContent =
            `Confirma o expurgo de ${quantidade} unidade(s) de "${produto.nome}"? Esta ação não pode ser desfeita.`;

        overlay.classList.add("show");

        document.querySelector("#modalCancelar").onclick = () => overlay.classList.remove("show");
        document.querySelector("#modalConfirmar").onclick = () => {
            overlay.classList.remove("show");

            produto.quantidade -= quantidade;          

            mensagemArea.innerHTML = `<p class="mensagem-sucesso">Expurgo de ${quantidade} unidade(s) de "${produto.nome}" registrado com sucesso.</p>`;
            document.querySelector("#formExpurgo").reset();
            infoEstoque.textContent = "";
        };
    });

});