"use strict";

let navegacaoDaSessao;
const paginasComMenuAdministrativo = new Set([
    "usuarios.html", "cadastrar_usuarios.html", "editar_usuario.html", "expurgo_estoque.html",
    "relatorios.html", "visualizar_relatorios.html", "relatorio_produtos.html"
]);

function configurarNavegacaoDaSessao() {
    return navegacaoDaSessao ??= carregarNavegacaoDaSessao();
}

async function carregarNavegacaoDaSessao() {
    try {
        const resposta = await fetch("/usuarios/me", { headers: { Accept: "application/json" } });
        if (resposta.status === 401) {
            window.location.replace("login.html");
            return null;
        }
        if (!resposta.ok) throw new Error("Perfil indisponível");
        const { nome, login, nivel } = await resposta.json();
        if (nivel !== 1 && nivel !== 2) throw new Error("Perfil não reconhecido");

        const ehTecnico = nivel === 2;
        const pagina = window.location.pathname.split("/").at(-1);
        if (ehTecnico && paginasComMenuAdministrativo.has(pagina)) {
            window.location.replace("dashboard_tec.html");
            return null;
        }
        const painel = ehTecnico ? "dashboard_tec.html" : "dashboard_adm.html";
        for (const link of document.querySelectorAll('a[href^="dashboard_adm.html"], a[href^="dashboard_tec.html"]')) {
            link.href = painel;
        }
        for (const link of document.querySelectorAll('a[href^="perfil.html"]')) {
            link.href = "perfil.html?origem=" + (ehTecnico ? "tecnico" : "adm");
        }
        padronizarMenuLateral(ehTecnico);

        const textos = {
            "#userRole": ehTecnico ? "Técnico" : "Administrador",
            "#username": login,
            "#userAvatar, .avatar": nome.trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0)).join("").toUpperCase(),
            "#produtosMenuText": ehTecnico ? "Consultar produtos" : "Produtos"
        };
        for (const [seletor, texto] of Object.entries(textos)) {
            const campo = document.querySelector(seletor);
            if (campo) campo.textContent = texto;
        }
        document.body.style.visibility = "";
        return { ehTecnico };
    } catch {
        const mensagem = document.createElement("p");
        mensagem.setAttribute("role", "alert");
        mensagem.textContent = "Não foi possível confirmar seu perfil. Recarregue a página para tentar novamente.";
        document.body.replaceChildren(mensagem);
        document.body.style.visibility = "";
        return null;
    }
}

document.addEventListener("DOMContentLoaded", configurarNavegacaoDaSessao);
