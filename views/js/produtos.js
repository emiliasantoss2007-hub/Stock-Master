
document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // IDENTIFICAÇÃO DA ORIGEM
    // ========================================

    const params = new URLSearchParams(window.location.search);
    const origem = params.get("origem");
    const ehTecnico = origem === "tecnico";

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
    const produtosMenuText = document.querySelector("#produtosMenuText");
    const breadcrumbPage = document.querySelector("#breadcrumbPage");
    const userRole = document.querySelector("#userRole");
    const username = document.querySelector("#username");

    // ========================================
    // CONFIGURAÇÃO POR PERFIL
    // ========================================

    if (!ehTecnico) {
        if (dashboardLink) dashboardLink.href = "dashboard_adm.html";
        if (breadcrumbLink) breadcrumbLink.href = "dashboard_adm.html";
        if (cadastrarProdutoLink) cadastrarProdutoLink.href = "cadastrar_produto.html?origem=adm";
        if (entradaLink) entradaLink.href = "entrada_estoque.html?origem=adm";
        if (userRole) userRole.textContent = "Administrador";
        if (username) username.textContent = "admin.stockmaster";
        if (produtosMenuText) produtosMenuText.textContent = "Produtos";
        if (breadcrumbPage) breadcrumbPage.textContent = "Produtos";
        if (usuariosLink) usuariosLink.style.display = "";
        if (expurgoLink) expurgoLink.style.display = "";
        if (relatoriosLink) relatoriosLink.style.display = "";
    } else {
        if (dashboardLink) dashboardLink.href = "dashboard_tec.html";
        if (breadcrumbLink) breadcrumbLink.href = "dashboard_tec.html";
        if (cadastrarProdutoLink) cadastrarProdutoLink.href = "cadastrar_produto.html?origem=tecnico";
        if (entradaLink) entradaLink.href = "entrada_estoque.html?origem=tecnico";
        if (userRole) userRole.textContent = "Técnico";
        if (username) username.textContent = "tecnico.stockmaster";
        if (produtosMenuText) produtosMenuText.textContent = "Consultar produtos";
        if (breadcrumbPage) breadcrumbPage.textContent = "Produtos";
        if (usuariosLink) usuariosLink.style.display = "none";
        if (expurgoLink) expurgoLink.style.display = "none";
        if (relatoriosLink) relatoriosLink.style.display = "none";
    }

    // ========================================
    // ELEMENTOS DA CONSULTA E FILTROS
    // ========================================

    const searchInput = document.querySelector("#searchProduct");
    const categoryFilter = document.querySelector("#filterCategory");
    const situationFilter = document.querySelector("#filterSituation");
    const tabelaProdutos = document.querySelector("#productsTableBody");
    const productsCount = document.querySelector("#productsCount");
    const productsMessage = document.querySelector("#productsMessage");

    if (!searchInput || !categoryFilter || !situationFilter ||
        !tabelaProdutos || !productsCount || !productsMessage) {
        console.error("Elementos da tela de consulta de produtos não encontrados.");
        return;
    }

    let produtos = [];
    let temporizadorBusca = null;

    function obterSituacao(produto) {
        return Number(produto.quantidadeEstoque) <= Number(produto.estoqueMinimo)
            ? "Crítico"
            : "Normal";
    }

    // ========================================
    // ELEMENTOS DO MODAL DE EXCLUSÃO
    // ========================================

    const deleteModal = document.querySelector("#deleteProductModal");
    const deleteProductName = document.querySelector("#deleteProductName");
    const deleteProductSku = document.querySelector("#deleteProductSku");
    const deleteProductId = document.querySelector("#deleteProductId");
    const deleteProductFeedback = document.querySelector("#deleteProductFeedback");
    const cancelDeleteProduct = document.querySelector("#cancelDeleteProduct");
    const confirmDeleteProduct = document.querySelector("#confirmDeleteProduct");

    let selectedProductId = null;
    let selectedProductRow = null;

    function setDeleteFeedback(message, type = "") {
        if (!deleteProductFeedback) return;

        deleteProductFeedback.textContent = message;
        deleteProductFeedback.className = type
            ? `product-feedback product-feedback-${type}`
            : "product-feedback";
    }

    function abrirModalExclusao(row) {
        if (!deleteModal || !row || ehTecnico) return;

        selectedProductRow = row;
        selectedProductId = row.dataset.productId;

        const nome = row.querySelector(".product-cell strong");
        const sku = row.querySelector("td:nth-child(2)");

        if (deleteProductName) deleteProductName.textContent = nome?.textContent || "";
        if (deleteProductSku) deleteProductSku.textContent = sku?.textContent || "";
        if (deleteProductId) deleteProductId.textContent = selectedProductId || "";

        setDeleteFeedback("");

        if (confirmDeleteProduct) confirmDeleteProduct.disabled = false;

        deleteModal.hidden = false;
        document.body.classList.add("product-modal-open");
    }

    function fecharModalExclusao() {
        if (!deleteModal) return;

        deleteModal.hidden = true;
        document.body.classList.remove("product-modal-open");
        selectedProductId = null;
        selectedProductRow = null;
    }

    if (cancelDeleteProduct) {
        cancelDeleteProduct.addEventListener("click", fecharModalExclusao);
    }

    if (deleteModal) {
        deleteModal.addEventListener("click", (event) => {
            if (event.target === deleteModal) fecharModalExclusao();
        });
    }

    // Delegação: funciona também com linhas criadas dinamicamente.
    tabelaProdutos.addEventListener("click", (event) => {
        const botaoExcluir = event.target.closest(".product-action-delete");

        if (!botaoExcluir || ehTecnico) return;

        const row = botaoExcluir.closest("tr");

        if (row) abrirModalExclusao(row);
    });

    // ========================================
    // CONFIRMAR EXCLUSÃO
    // ========================================

    if (confirmDeleteProduct) {
        confirmDeleteProduct.addEventListener("click", async () => {
            if (!selectedProductId || !selectedProductRow) return;

            const token = sessionStorage.getItem("stockmaster.accessToken");

            if (!token) {
                setDeleteFeedback("Sessão expirada. Faça login novamente.", "error");
                return;
            }

            confirmDeleteProduct.disabled = true;
            setDeleteFeedback("Excluindo produto...", "pending");

            try {
                const response = await fetch(
                    `/api/produtos/${encodeURIComponent(selectedProductId)}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Accept": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok || data.sucesso === false) {
                    throw new Error(
                        data.mensagem || "Não foi possível excluir o produto."
                    );
                }

                const idExcluido = String(selectedProductId);

                produtos = produtos.filter(
                    (produto) => String(produto.idProduto) !== idExcluido
                );

                fecharModalExclusao();
                aplicarFiltrosLocais();

                productsMessage.textContent =
                    data.mensagem || "Produto excluído com sucesso.";

            } catch (erro) {
                setDeleteFeedback(erro.message, "error");

            } finally {
                confirmDeleteProduct.disabled = false;
            }
        });
    }

    // ========================================
    // MONTAGEM DA TABELA
    // ========================================

    function preencherTabela(lista) {
        tabelaProdutos.innerHTML = "";

        lista.forEach((produto) => {
            const linha = document.createElement("tr");
            linha.dataset.productId = produto.idProduto;

            const situacao = obterSituacao(produto);

            const nome = document.createElement("strong");
            nome.textContent = produto.nome;

            const descricao = document.createElement("small");
            descricao.textContent = produto.descricao || "Sem descrição";

            const identificacao = document.createElement("div");
            identificacao.className = "product-cell";

            const miniatura = document.createElement("span");
            miniatura.className = "product-thumb";
            miniatura.textContent = "▣";

            const detalhes = document.createElement("div");
            detalhes.append(nome, descricao);
            identificacao.append(miniatura, detalhes);

            const celulaProduto = document.createElement("td");
            celulaProduto.append(identificacao);

            const celulaSku = document.createElement("td");
            celulaSku.textContent = produto.sku || "";

            const celulaCategoria = document.createElement("td");
            celulaCategoria.textContent = produto.categoria || "";

            const celulaSaldo = document.createElement("td");
            const saldo = document.createElement("span");
            saldo.className = "stock-value";
            saldo.textContent = `${produto.quantidadeEstoque} un.`;
            celulaSaldo.append(saldo);

            const celulaSituacao = document.createElement("td");
            const status = document.createElement("span");

            status.className = situacao === "Crítico"
                ? "status status-warning"
                : "status status-success";

            status.textContent = situacao === "Crítico"
                ? "Estoque crítico"
                : "Normal";

            celulaSituacao.append(status);

            const celulaAcoes = document.createElement("td");
            const acoes = document.createElement("div");
            acoes.className = "product-table-actions";

            const editar = document.createElement("a");
            editar.className = "product-action product-action-edit";
            editar.textContent = "Editar";

            editar.href = ehTecnico
                ? `editar_produto.html?id=${encodeURIComponent(produto.idProduto)}&origem=tecnico`
                : `editar_produto.html?id=${encodeURIComponent(produto.idProduto)}&origem=adm`;

            const visualizar = document.createElement("a");
            visualizar.className = "product-action product-action-view";
            visualizar.textContent = "Detalhes";

            visualizar.href = ehTecnico
                ? `produto_detalhes.html?id=${encodeURIComponent(produto.idProduto)}&origem=tecnico`
                : `produto_detalhes.html?id=${encodeURIComponent(produto.idProduto)}&origem=adm`;

            acoes.append(editar, visualizar);

            if (!ehTecnico) {
                const excluir = document.createElement("button");
                excluir.type = "button";
                excluir.className = "product-action product-action-delete";
                excluir.textContent = "Excluir";
                acoes.append(excluir);
            }

            celulaAcoes.append(acoes);

            linha.append(
                celulaProduto,
                celulaSku,
                celulaCategoria,
                celulaSaldo,
                celulaSituacao,
                celulaAcoes
            );

            tabelaProdutos.append(linha);
        });

        productsCount.textContent = `${lista.length} produto(s)`;
    }

    // ========================================
    // FILTROS LOCAIS
    // ========================================

    function aplicarFiltrosLocais() {
        const situacaoSelecionada = situationFilter.value;
        const termo = searchInput.value.trim().toLowerCase();
        const categoriaSelecionada = categoryFilter.value;

        const filtrados = produtos.filter((produto) => {
            const correspondeSituacao =
                !situacaoSelecionada || obterSituacao(produto) === situacaoSelecionada;

            const correspondeBusca = !termo ||
                String(produto.nome || "").toLowerCase().includes(termo) ||
                String(produto.sku || "").toLowerCase().includes(termo) ||
                String(produto.categoria || "").toLowerCase().includes(termo);

            const correspondeCategoria = !categoriaSelecionada ||
                produto.categoria === categoriaSelecionada;

            return correspondeSituacao && correspondeBusca && correspondeCategoria;
        });

        preencherTabela(filtrados);

        productsMessage.textContent = filtrados.length === 0
            ? "Nenhum produto encontrado para os filtros informados."
            : "";
    }

    // ========================================
    // CONSULTA À API
    // ========================================

    async function consultarProdutos() {
        const busca = searchInput.value.trim();
        const categoria = categoryFilter.value;
        const parametros = new URLSearchParams();
        
        if (busca) parametros.set("busca", busca);
        if (categoria) parametros.set("categoria", categoria);

        productsMessage.textContent = "Consultando produtos...";
        tabelaProdutos.innerHTML = "";
        productsCount.textContent = "Consultando...";

        try {
            const token = sessionStorage.getItem("stockmaster.accessToken");
            const resposta = await fetch(`/api/produtos/consulta?${parametros.toString()}`,
            {headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    }
);

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.success) {
                throw new Error(
                    resultado.message || "Erro ao consultar produtos."
                );
            }

            produtos = resultado.data?.produtos || [];
            aplicarFiltrosLocais();

        } catch (erro) {
            console.error("Erro na consulta:", erro);

            produtos = [];
            tabelaProdutos.innerHTML = "";
            productsCount.textContent = "0 produto(s)";
            productsMessage.textContent =
                "Não foi possível consultar os produtos. Tente novamente.";
        }
    }

    // ========================================
    // EVENTOS DOS FILTROS
    // ========================================

    searchInput.addEventListener("input", () => {
        clearTimeout(temporizadorBusca);
        temporizadorBusca = setTimeout(consultarProdutos, 300);
    });

    categoryFilter.addEventListener("change", consultarProdutos);
    situationFilter.addEventListener("change", aplicarFiltrosLocais);

    // ========================================
    // CONSULTA INICIAL
    // ========================================

    consultarProdutos();
});