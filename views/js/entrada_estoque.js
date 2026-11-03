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


    // CÓDIGO ESPECÍFICO DA PÁGINA

    const select = document.querySelector("#produtoSelect");
    const infoEstoque = document.querySelector("#infoEstoque");
    const mensagemArea = document.querySelector("#mensagemArea");
    const formulario = document.querySelector("#formEntrada");
    const campoQuantidade = document.querySelector("#quantidade");

    const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    // PREPARAR CABEÇALHOS
    function obterCabecalhos() {
        return {
            "Content-Type": "application/json",
            "X-User": JSON.stringify({
                id_usuario: usuario?.id_usuario
            })
        };
    }

    // EXIBIR MENSAGEM
    function mostrarMensagem(texto, tipo) {
        mensagemArea.innerHTML = "";

        const mensagem = document.createElement("p");
        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : "mensagem-erro";

        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    // CARREGAR PRODUTOS
    async function carregarProdutos() {
        try {
            if (!usuario?.id_usuario) {
                mostrarMensagem("Faça login novamente.", "erro");
                return;
            }

            const resposta = await fetch(
                "/api/produtos/entrada/listar",
                { headers: obterCabecalhos() }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao carregar produtos.");
            }

            select.innerHTML =
                '<option value="">Selecione um produto...</option>';

            resultado.produtos.forEach((produto) => {
                const opcao = document.createElement("option");
                opcao.value = produto.id_produto;
                opcao.textContent = `${produto.nome} (SKU: ${produto.sku})`;
                select.appendChild(opcao);
            });
        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    }

    // MOSTRAR SALDO ATUAL
    select.addEventListener("change", async () => {
        infoEstoque.textContent = "";

        if (!select.value) return;

        try {
            const resposta = await fetch(
                "/api/produtos/entrada/listar",
                { headers: obterCabecalhos() }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error("Não foi possível consultar o estoque.");
            }

            const produto = resultado.produtos.find(
                (item) => String(item.id_produto) === select.value
            );

            if (produto) {
                infoEstoque.textContent =
                    `Estoque atual: ${produto.quantidade_estoque} unidade(s).`;
            }
        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    });

    // REGISTRAR ENTRADA
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagemArea.innerHTML = "";

        const idProduto = Number(select.value);
        const quantidade = Number(campoQuantidade.value);

        if (!Number.isInteger(idProduto) || idProduto <= 0) {
            mostrarMensagem("Selecione um produto válido.", "erro");
            return;
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            mostrarMensagem("Informe uma quantidade inteira maior que zero.", "erro");
            return;
        }

        try {
            const resposta = await fetch("/api/produtos/entrada", {
                method: "POST",
                headers: obterCabecalhos(),
                body: JSON.stringify({
                    id_produto: idProduto,
                    quantidade
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao registrar entrada.");
            }

            mostrarMensagem(resultado.mensagem, "sucesso");
            formulario.reset();
            infoEstoque.textContent = "";

            await carregarProdutos();
        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    });

    // LIMPAR MENSAGENS
    formulario.addEventListener("reset", () => {
        mensagemArea.innerHTML = "";
        infoEstoque.textContent = "";
    });

    // INICIALIZAR
    carregarProdutos();

});