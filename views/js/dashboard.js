"use strict";

const indicadoresDashboard = document.querySelectorAll("[data-indicador]");
const movimentacoesDashboard = document.querySelector("#movimentacoesDashboard");
const alertaEstoque = document.querySelector("#alertaEstoque");
const numerosDashboard = new Intl.NumberFormat("pt-BR");
const datasDashboard = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const tiposDashboard = { ENTRADA: "Entrada", SAIDA: "Saída", "SAÍDA": "Saída", EXPURGO: "Expurgo" };

function informarMovimentacoes(mensagem) {
    movimentacoesDashboard.replaceChildren();
    const celula = movimentacoesDashboard.insertRow().insertCell();
    celula.colSpan = 5;
    celula.setAttribute("role", "status");
    celula.textContent = mensagem;
}

async function carregarDashboard() {
    for (const campo of indicadoresDashboard) campo.textContent = "—";
    informarMovimentacoes("Carregando movimentações...");
    alertaEstoque.textContent = "Carregando dados do estoque...";
    try {
        const resposta = await fetch("/api/dashboard");
        if (resposta.status === 401) {
            window.location.replace("login.html");
            return;
        }
        if (resposta.status === 403) {
            alertaEstoque.textContent = "Acesso restrito a administradores.";
            informarMovimentacoes("Acesso restrito a administradores.");
            return;
        }
        if (!resposta.ok) throw new Error();
        const { indicadores, recentes } = await resposta.json();
        for (const campo of indicadoresDashboard) {
            campo.textContent = numerosDashboard.format(indicadores[campo.dataset.indicador]);
        }

        alertaEstoque.textContent = indicadores.criticos === 0
            ? "Nenhum produto no limite mínimo ou abaixo."
            : indicadores.criticos === 1
                ? "1 produto no limite mínimo ou abaixo."
                : `${numerosDashboard.format(indicadores.criticos)} produtos no limite mínimo ou abaixo.`;

        movimentacoesDashboard.replaceChildren();
        for (const item of recentes) {
            const linha = movimentacoesDashboard.insertRow();
            const data = item.data ? new Date(item.data) : null;
            const tipo = tiposDashboard[String(item.tipo).toUpperCase()] ?? item.tipo;
            for (const valor of [item.produto, tipo, item.quantidade,
                data && Number.isFinite(data.getTime()) ? datasDashboard.format(data) : null,
                item.responsavel]) {
                linha.insertCell().textContent = valor ?? "—";
            }
        }
        if (!recentes.length) informarMovimentacoes("Nenhuma movimentação recente.");
    } catch {
        for (const campo of indicadoresDashboard) campo.textContent = "—";
        alertaEstoque.textContent = "Dados do estoque indisponíveis.";
        informarMovimentacoes("Não foi possível carregar o painel. Recarregue a página para tentar novamente.");
    }
}

carregarDashboard();
window.addEventListener("pageshow", evento => {
    if (evento.persisted) carregarDashboard();
});
