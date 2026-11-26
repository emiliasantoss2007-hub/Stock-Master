"use strict";

const itensMenuLateral = [
    [
        "dashboard_adm.html",
        "Dashboard",
        "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>"
    ],
    [
        "usuarios.html",
        "Usuários",
        "<circle cx=\"9\" cy=\"7\" r=\"3\"/><path d=\"M2 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2m0-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 4 5v2\"/>"
    ],
    [
        "produtos.html",
        "Produtos",
        "<path d=\"m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10\"/>"
    ],
    [
        "entrada_estoque.html",
        "Entrada de estoque",
        "<path d=\"M5 12h14m-7-7v14\"/>"
    ],
    [
        "saída_estoque.html",
        "Saída de estoque",
        "<path d=\"M5 12h14\"/>"
    ],
    [
        "expurgo_estoque.html",
        "Expurgo",
        "<path d=\"M3 6h18M9 6V3h6v3m4 0-1 15H6L5 6m5 4v7m4-7v7\"/>"
    ],
    [
        "historico_movimentacao.html",
        "Histórico",
        "<path d=\"M3 12a9 9 0 1 1 2.6 6.4M3 5v7h7m2-5v5l3 2\"/>"
    ],
    [
        "relatorios.html",
        "Relatórios",
        "<path d=\"M3 3v18h18M8 17v-5m5 5V6m5 11V9\"/>"
    ],
    [
        "perfil.html",
        "Meu perfil",
        "<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2\"/>"
    ],
    [
        "login.html",
        "Sair",
        "<path d=\"M10 3H4v18h6m4-14 5 5-5 5m5-5H8\"/>"
    ]
];
const gruposMenuLateral = [
    ["Menu principal", [0]],
    ["Gerenciamento", [1, 2]],
    ["Movimentações", [3, 4, 5]],
    ["Consultas", [6, 7]]
];

function padronizarMenuLateral(ehTecnico) {
    const menu = document.querySelector(".sidebar");
    const links = [...menu.querySelectorAll("a")];
    const nav = document.createElement("nav");
    nav.className = "sidebar-nav";
    nav.setAttribute("aria-label", "Menu lateral");

    function montarLink(indice) {
        if (ehTecnico && [1, 5, 7].includes(indice)) return null;
        const [destino, titulo, desenho] = itensMenuLateral[indice];
        const link = links.find(a => {
            const pagina = a.getAttribute("href").split("?")[0];
            return pagina === destino || (indice === 0 && pagina === "dashboard_tec.html");
        }) || document.createElement("a");
        if (!link.hasAttribute("href")) link.href = destino;
        link.style.removeProperty("display");
        const rotulo = document.createElement("span");
        if (indice === 2) rotulo.id = "produtosMenuText";
        rotulo.textContent = indice === 2 && ehTecnico ? "Consultar produtos" : titulo;
        // Os desenhos são constantes internas. Os textos usam textContent.
        link.innerHTML = '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + desenho + '</svg>';
        link.append(rotulo);
        return link;
    }

    for (const [titulo, indices] of gruposMenuLateral) {
        const grupo = document.createElement("div");
        const rotulo = document.createElement("p");
        rotulo.className = "nav-title";
        rotulo.textContent = titulo;
        grupo.append(rotulo, ...indices.map(montarLink).filter(Boolean));
        nav.append(grupo);
    }

    const marca = document.createElement("div");
    marca.className = "brand";
    const logo = document.createElement("img");
    logo.className = "admin-brand-logo";
    logo.src = "../assets/logopreto.png";
    logo.alt = "StockMaster";
    marca.append(logo);

    const rodape = document.createElement("div");
    rodape.className = "sidebar-bottom";
    rodape.append(montarLink(8), montarLink(9));
    menu.replaceChildren(marca, nav, rodape);
    menu.classList.add("sidebar-padronizado");
}
