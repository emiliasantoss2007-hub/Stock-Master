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

    const filtroProduto = document.querySelector("#filtroProduto");
    const tabela = document.querySelector("#tabelaHistorico");

    const produtos = [
        
    {
        id: 1,
        nome: "Display LCD 6.1"
    },
    {
        id: 2,
        nome: "Bateria modelo A20"
    },
    {
        id: 3,
        nome: "Conector USB-C"
    }
];
const movimentacoes = [
    {
        data: "2026-09-08T14:30:00",
        produtoId: 1,
        tipo: "Entrada",
        quantidade: 10,
        usuario: "admin.stockmaster",
        justificativa: "Reposição de estoque"
    },
    {
        data: "2026-09-08T11:15:00",
        produtoId: 3,
        tipo: "Saída",
        quantidade: 2,
        usuario: "tecnico.stockmaster",
        justificativa: "Utilização em manutenção"
    },
    {
        data: "2026-09-07T16:40:00",
        produtoId: 2,
        tipo: "Expurgo",
        quantidade: 3,
        usuario: "admin.stockmaster",
        justificativa: "Produto danificado"
    },
    {
        data: "2026-09-06T10:20:00",
        produtoId: 1,
        tipo: "Saída",
        quantidade: 4,
        usuario: "tecnico.stockmaster",
        justificativa: "Utilização em manutenção"
    },
    {
        data: "2026-09-05T09:10:00",
        produtoId: 2,
        tipo: "Entrada",
        quantidade: 15,
        usuario: "admin.stockmaster",
        justificativa: "Reposição de estoque"
    }
];

produtos.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nome;
    filtroProduto.appendChild(opt);
});

    function badgeTipo(tipo) {
        const classes = { Entrada: "badge-entrada", Saída: "badge-saida", Expurgo: "badge-expurgo" };
        return `<span class="badge-tipo ${classes[tipo] || ""}">${tipo}</span>`;
    }

    function renderizar(lista) {
        tabela.innerHTML = "";

        if (!lista.length) {
            tabela.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px;">Nenhuma movimentação encontrada.</td></tr>`;
            return;
        }

        lista
            .slice()
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .forEach((mov) => {
                const produto = produtos.find((p) => p.id === Number(mov.produtoId));
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td data-label="Data">${smFormatarData(mov.data)}</td>
                    <td data-label="Produto">${produto ? produto.nome : "Produto removido"}</td>
                    <td data-label="Tipo">${badgeTipo(mov.tipo)}</td>
                    <td data-label="Quantidade">${mov.quantidade}</td>
                    <td data-label="Responsável">${mov.usuario}</td>
                    <td data-label="Justificativa">${mov.justificativa || "-"}</td>
                `;

                tabela.appendChild(tr);
            });
    }

    function aplicarFiltros() {
        let lista = movimentacoes;

        const produtoId = filtroProduto.value;
        const tipo = document.querySelector("#filtroTipo").value;
        const dataInicio = document.querySelector("#filtroDataInicio").value;
        const dataFim = document.querySelector("#filtroDataFim").value;

        if (produtoId) lista = lista.filter((m) => m.produtoId === Number(produtoId));
        if (tipo) lista = lista.filter((m) => m.tipo === tipo);
        if (dataInicio) lista = lista.filter((m) => new Date(m.data) >= new Date(dataInicio + "T00:00:00"));
        if (dataFim) lista = lista.filter((m) => new Date(m.data) <= new Date(dataFim + "T23:59:59"));

        function formatarData(data) {const dataObj = new Date(data);
            return dataObj.toLocaleDateString("pt-BR") + " " + dataObj.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
}
        renderizar(lista);
    }

    document.querySelector("#btnFiltrar").addEventListener("click", aplicarFiltros);

    document.querySelector("#btnLimparFiltros").addEventListener("click", () => {
        filtroProduto.value = "";
        document.querySelector("#filtroTipo").value = "";
        document.querySelector("#filtroDataInicio").value = "";
        document.querySelector("#filtroDataFim").value = "";
        aplicarFiltros();
    });

    renderizar(movimentacoes);

});