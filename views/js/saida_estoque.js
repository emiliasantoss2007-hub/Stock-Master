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

        if (dashboardLink) dashboardLink.href = "dashboard_adm.html";
        if (breadcrumbLink) breadcrumbLink.href = "dashboard_adm.html";
        if (produtosLink) produtosLink.href = "produtos.html?origem=adm";
        if (produtosMenuText) produtosMenuText.textContent = "Produtos";

        if (entradaLink) entradaLink.href = "entrada_estoque.html?origem=adm";
        if (saidaLink) saidaLink.href = "saída_estoque.html?origem=adm";
        if (expurgoLink) expurgoLink.href = "expurgo_estoque.html?origem=adm";
        if (historicoLink) historicoLink.href = "historico_movimentacao.html?origem=adm";
        if (relatoriosLink) relatoriosLink.href = "relatorios.html?origem=adm";
        if (perfilLink) perfilLink.href = "perfil.html?origem=adm";

        if (userRole) userRole.textContent = "Administrador";
        if (username) username.textContent = "admin.stockmaster";
        if (userAvatar) userAvatar.textContent = "AD";

        if (usuariosLink) usuariosLink.style.display = "";
        if (expurgoLink) expurgoLink.style.display = "";
        if (relatoriosLink) relatoriosLink.style.display = "";
    }


    // ========================================
    // TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        if (dashboardLink) dashboardLink.href = "dashboard_tec.html";
        if (breadcrumbLink) breadcrumbLink.href = "dashboard_tec.html";
        if (produtosLink) produtosLink.href = "produtos.html?origem=tecnico";
        if (produtosMenuText) produtosMenuText.textContent = "Consultar produtos";

        if (entradaLink) entradaLink.href = "entrada_estoque.html?origem=tecnico";
        if (saidaLink) saidaLink.href = "saída_estoque.html?origem=tecnico";
        if (historicoLink) historicoLink.href = "historico_movimentacao.html?origem=tecnico";
        if (perfilLink) perfilLink.href = "perfil.html?origem=tecnico";

        if (userRole) userRole.textContent = "Técnico";
        if (username) username.textContent = "tecnico.stockmaster";
        if (userAvatar) userAvatar.textContent = "TC";

        if (usuariosLink) usuariosLink.style.display = "none";
        if (expurgoLink) expurgoLink.style.display = "none";
        if (relatoriosLink) relatoriosLink.style.display = "none";
    }


    // ========================================
    // CÓDIGO ESPECÍFICO DA PÁGINA
    // ========================================

    const select = document.querySelector("#produtoSelect");
    const infoEstoque = document.querySelector("#infoEstoque");
    const mensagemArea = document.querySelector("#mensagemArea");
    const formulario = document.querySelector("#formSaida");
    const campoQuantidade = document.querySelector("#quantidade");

    const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    let produtosCarregados = [];

    function obterCabecalhos() {
        const headers = {
            "Content-Type": "application/json"
        };

        if (usuario?.id_usuario) {
            headers["X-User"] = JSON.stringify({
                id_usuario: usuario.id_usuario,
                id_nivel_acesso: usuario.id_nivel_acesso,
                nome: usuario.nome,
                login: usuario.login
            });
        }

        return headers;
    }

    function mostrarMensagem(texto, tipo = "erro") {
        if (!mensagemArea) return;
        mensagemArea.innerHTML = "";

        const mensagem = document.createElement("p");
        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : tipo === "alerta"
                ? "mensagem-alerta"
                : "mensagem-erro";

        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    async function carregarProdutos() {
        try {
            const resposta = await fetch(
                "/api/produtos/entrada/listar",
                {
                    method: "GET",
                    credentials: "include",
                    headers: obterCabecalhos()
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao carregar produtos.");
            }

            produtosCarregados = Array.isArray(resultado.produtos)
                ? resultado.produtos
                : [];

            select.innerHTML = '<option value="">Selecione um produto...</option>';

            produtosCarregados.forEach((produto) => {
                const opcao = document.createElement("option");
                opcao.value = produto.id_produto;
                opcao.textContent = `${produto.nome} (SKU: ${produto.sku})`;
                select.appendChild(opcao);
            });
        } catch (erro) {
            mostrarMensagem(erro.message || "Não foi possível carregar os produtos.", "erro");
        }
    }

    select.addEventListener("change", () => {
        if (!infoEstoque) return;
        infoEstoque.textContent = "";

        if (!select.value) return;

        const produto = produtosCarregados.find(
            (item) => String(item.id_produto) === String(select.value)
        );

        if (produto) {
            infoEstoque.textContent =
                `Estoque disponível: ${produto.quantidade_estoque} unidade(s).`;
        }
    });

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (mensagemArea) mensagemArea.innerHTML = "";

        const idProduto = Number(select.value);
        const quantidade = Number(campoQuantidade.value);

        if (!Number.isInteger(idProduto) || idProduto <= 0) {
            mostrarMensagem("Selecione um produto para continuar.", "erro");
            return;
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            mostrarMensagem("Informe uma quantidade maior que zero.", "erro");
            return;
        }

        const produto = produtosCarregados.find(
            (p) => Number(p.id_produto) === idProduto
        );

        if (!produto) {
            mostrarMensagem("Produto não encontrado.", "erro");
            return;
        }

        // RN10: não permitir saída maior que o estoque disponível
        if (quantidade > Number(produto.quantidade_estoque)) {
            mostrarMensagem(
                `Estoque insuficiente. Disponível: ${produto.quantidade_estoque} unidade(s).`,
                "alerta"
            );
            return;
        }

        try {
            const resposta = await fetch("/api/produtos/saida", {
                method: "POST",
                credentials: "include",
                headers: obterCabecalhos(),
                body: JSON.stringify({
                    id_produto: idProduto,
                    quantidade
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao registrar saída.");
            }

            const novoSaldo = resultado.dados?.quantidade_estoque ?? (Number(produto.quantidade_estoque) - quantidade);
            let textoSucesso = resultado.mensagem || `Saída de ${quantidade} unidade(s) de "${produto.nome}" registrada com sucesso!`;

            mostrarMensagem(textoSucesso, "sucesso");

            if (novoSaldo <= 5 && mensagemArea) {
                const alerta = document.createElement("p");
                alerta.className = "mensagem-alerta";
                alerta.textContent = `Atenção: "${produto.nome}" está com estoque crítico (${novoSaldo} unidade(s)).`;
                mensagemArea.appendChild(alerta);
            }

            formulario.reset();
            if (infoEstoque) infoEstoque.textContent = "";
            await carregarProdutos();
        } catch (erro) {
            mostrarMensagem(erro.message || "Erro ao registrar saída.", "erro");
        }
    });

    formulario.addEventListener("reset", () => {
        if (mensagemArea) mensagemArea.innerHTML = "";
        if (infoEstoque) infoEstoque.textContent = "";
    });

    carregarProdutos();

});