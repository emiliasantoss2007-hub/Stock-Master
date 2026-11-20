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

    const cadastrarProdutoLink = document.querySelector("#cadastrarProdutoLink");

    const usuariosLink = document.querySelector("#usuariosLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");

    const entradaLink = document.querySelector("#entradaLink");
    const saidaLink = document.querySelector("#saidaLink");
    const historicoLink = document.querySelector("#historicoLink");

    const produtosMenuText =
        document.querySelector("#produtosMenuText");

    const breadcrumbPage =
        document.querySelector("#breadcrumbPage");

    const userRole =
        document.querySelector("#userRole");

    const username =
        document.querySelector("#username");


    // ========================================
    // CONFIGURAÇÃO DO ADMINISTRADOR
    // ========================================

    if (origem !== "tecnico") {

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
    }


    // ========================================
    // CONFIGURAÇÃO DO TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        if (dashboardLink) dashboardLink.href = "dashboard_tec.html";
        if (breadcrumbLink) breadcrumbLink.href = "dashboard_tec.html";

        if (cadastrarProdutoLink) cadastrarProdutoLink.href = "cadastrar_produto.html?origem=tecnico";
        if (entradaLink) entradaLink.href = "entrada_estoque.html?origem=tecnico";

        if (userRole) userRole.textContent = "Técnico";
        if (username) username.textContent = "tecnico.stockmaster";

        if (produtosMenuText) produtosMenuText.textContent = "Consultar produtos";
        if (breadcrumbPage) breadcrumbPage.textContent = "Produtos";

        // Esconde funções exclusivas do administrador
        if (usuariosLink) usuariosLink.style.display = "none";
        if (expurgoLink) expurgoLink.style.display = "none";
        if (relatoriosLink) relatoriosLink.style.display = "none";

        document.querySelectorAll(".product-action-delete").forEach((button) => {
            button.hidden = true;
        });
    }


    // ========================================
    // MANTER ORIGEM NO EDITAR
    // ========================================

    const editLinks =
        document.querySelectorAll(".product-action-edit");

    editLinks.forEach((link) => {

        const productId =
            new URLSearchParams(link.search).get("id");

        link.href = origem === "tecnico"
            ? `editar_produto.html?id=${productId}&origem=tecnico`
            : `editar_produto.html?id=${productId}&origem=adm`;
    });


    // ========================================
    // MANTER ORIGEM NOS DETALHES
    // ========================================

    const detailLinks =
        document.querySelectorAll(".product-action-view");

    detailLinks.forEach((link) => {

        const productId =
            new URLSearchParams(link.search).get("id");

        link.href = origem === "tecnico"
            ? `produto_detalhes.html?id=${productId}&origem=tecnico`
            : `produto_detalhes.html?id=${productId}&origem=adm`;
    });


    // ========================================
    // BUSCA E FILTROS DE PRODUTOS
    // ========================================

    const searchInput =
        document.querySelector("#searchProduct");

    const categoryFilter =
        document.querySelector("#filterCategory");

    const situationFilter =
        document.querySelector("#filterSituation");

    let rows = Array.from(
        document.querySelectorAll("#productsTableBody tr")
    );

    const productsCount =
        document.querySelector("#productsCount");

    const productsMessage =
        document.querySelector("#productsMessage");


    // ========================================
    // EXCLUSÃO DE PRODUTOS
    // ========================================

    const deleteModal = document.querySelector("#deleteProductModal");
    const deleteModalPanel = deleteModal?.querySelector(".product-confirm-modal") || null;
    const deleteProductName = document.querySelector("#deleteProductName");
    const deleteProductSku = document.querySelector("#deleteProductSku");
    const deleteProductId = document.querySelector("#deleteProductId");
    const deleteProductFeedback = document.querySelector("#deleteProductFeedback");
    const cancelDeleteProduct = document.querySelector("#cancelDeleteProduct");
    const confirmDeleteProduct = document.querySelector("#confirmDeleteProduct");

    let selectedProductRow = null;
    let selectedProductId = null;
    let lastFocusedElement = null;

    function showDeleteFeedback(message, type = "") {
        if (!deleteProductFeedback) return;
        deleteProductFeedback.textContent = message;
        deleteProductFeedback.className =
            `product-feedback${type ? ` product-feedback-${type}` : ""}`;
    }

    function openDeleteModal(button) {
        if (origem === "tecnico" || !deleteModal) return;

        const row = button.closest("tr");
        if (!row) return;

        selectedProductRow = row;
        selectedProductId =
            button.dataset.productId || row.dataset.productId;

        lastFocusedElement = document.activeElement;

        const cells = row.querySelectorAll("td");

        const productName =
            cells[0]?.querySelector("strong")?.textContent.trim()
            || "Produto sem nome";

        const sku =
            cells[1]?.textContent.trim()
            || "SKU não informado";

        if (deleteProductName) deleteProductName.textContent = productName;
        if (deleteProductSku) deleteProductSku.textContent = sku;
        if (deleteProductId) {
            deleteProductId.textContent =
                `ID do produto: ${selectedProductId || "não informado"}`;
        }

        showDeleteFeedback("");

        if (confirmDeleteProduct) {
            confirmDeleteProduct.disabled = false;
            confirmDeleteProduct.textContent = "Confirmar exclusão";
        }
        if (cancelDeleteProduct) {
            cancelDeleteProduct.disabled = false;
            cancelDeleteProduct.textContent = "Cancelar";
        }

        deleteModal.hidden = false;
        document.body.classList.add("product-modal-open");

        if (confirmDeleteProduct) {
            confirmDeleteProduct.focus();
        }
    }

    function closeDeleteModal() {
        if (!deleteModal) return;

        // Não permite fechar enquanto a solicitação está em andamento.
        if (confirmDeleteProduct?.disabled &&
            !deleteProductFeedback?.classList.contains("product-feedback-success")) {
            return;
        }

        deleteModal.hidden = true;
        document.body.classList.remove("product-modal-open");

        selectedProductRow = null;
        selectedProductId = null;

        if (lastFocusedElement &&
            typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    // Abre a confirmação para o produto selecionado.
    document.querySelectorAll(".product-action-delete").forEach((button) => {
        button.addEventListener("click", () => openDeleteModal(button));
    });

    if (cancelDeleteProduct) {
        cancelDeleteProduct.addEventListener("click", closeDeleteModal);
    }

    if (deleteModal) {
        // Permite fechar clicando no fundo do modal.
        deleteModal.addEventListener("click", (event) => {
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });

        // Permite fechar com Escape.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !deleteModal.hidden) {
                closeDeleteModal();
            }
        });
    }

    // Confirma e envia a solicitação de exclusão.
    if (confirmDeleteProduct) {
        confirmDeleteProduct.addEventListener("click", async () => {
            if (!selectedProductId || !selectedProductRow) {
                showDeleteFeedback(
                    "Não foi possível identificar o produto selecionado.",
                    "error"
                );
                return;
            }

            confirmDeleteProduct.disabled = true;
            if (cancelDeleteProduct) cancelDeleteProduct.disabled = true;
            confirmDeleteProduct.textContent = "Excluindo...";

            showDeleteFeedback(
                "Enviando solicitação de exclusão...",
                "pending"
            );

            // Usuário logado (admin) — mesmo padrão dos testes do RF-10
            const usuarioLogado = {
                id_usuario: 2,
                id_nivel_acesso: 1,
                nome: "Administrador"
            };

            try {
                const response = await fetch(
                    `/api/produtos/${encodeURIComponent(selectedProductId)}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "X-User": JSON.stringify(usuarioLogado)
                        }
                    }
                );

                let data = {};
                const responseText = await response.text();

                if (responseText) {
                    try {
                        data = JSON.parse(responseText);
                    } catch {
                        if (response.ok) {
                            throw new Error(
                                "O servidor retornou uma resposta inválida."
                            );
                        }
                    }
                }

                if (!response.ok || data.sucesso === false) {
                    if (response.status === 403) {
                        throw new Error(
                            data.mensagem ||
                            "Acesso negado. Apenas administradores podem excluir produtos."
                        );
                    }

                    if (response.status === 404) {
                        throw new Error(
                            data.mensagem ||
                            "Produto não encontrado."
                        );
                    }

                    if (response.status === 409) {
                        throw new Error(
                            data.mensagem ||
                            "Não é possível excluir o produto (estoque ou movimentações)."
                        );
                    }

                    throw new Error(
                        data.mensagem ||
                        "Não foi possível excluir o produto. Tente novamente."
                    );
                }

                const productName = deleteProductName?.textContent || "Produto";
                const rowToRemove = selectedProductRow;

                rowToRemove.remove();
                rows = rows.filter((row) => row !== rowToRemove);
                filterProducts();

                showDeleteFeedback(
                    data.mensagem ||
                    `Produto "${productName}" excluído com sucesso.`,
                    "success"
                );

                confirmDeleteProduct.textContent = "Concluído";
                if (cancelDeleteProduct) {
                    cancelDeleteProduct.disabled = false;
                    cancelDeleteProduct.textContent = "Fechar";
                }

                selectedProductRow = null;
                selectedProductId = null;

            } catch (error) {
                console.error("Erro ao excluir produto:", error);

                showDeleteFeedback(
                    error.message ||
                    "Falha de comunicação. Verifique a conexão e tente novamente.",
                    "error"
                );

                confirmDeleteProduct.disabled = false;
                if (cancelDeleteProduct) cancelDeleteProduct.disabled = false;
                confirmDeleteProduct.textContent = "Tentar novamente";
            }
        });
    }

    // Mantém o foco dentro do modal durante a navegação por teclado.
    if (deleteModalPanel) {
        deleteModalPanel.addEventListener("keydown", (event) => {
            if (event.key !== "Tab") return;

            const focusable = Array.from(
                deleteModalPanel.querySelectorAll("button:not([disabled])")
            );

            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }


    function filterProducts() {

        const search =
            searchInput?.value.trim().toLowerCase() || "";

        const category =
            categoryFilter?.value || "";

        const situation =
            situationFilter?.value || "";

        let visibleRows = 0;

        rows.forEach((row) => {

            const matchesSearch =
                !search ||
                (row.dataset.search || "").includes(search);

            const matchesCategory =
                !category ||
                row.dataset.category === category;

            const matchesSituation =
                !situation ||
                row.dataset.situation === situation;

            const shouldShow =
                matchesSearch &&
                matchesCategory &&
                matchesSituation;

            row.hidden = !shouldShow;

            if (shouldShow) {
                visibleRows++;
            }
        });

        if (productsCount) {
            productsCount.textContent =
                `${visibleRows} produto(s)`;
        }

        if (productsMessage) {
            productsMessage.textContent =
                visibleRows === 0
                    ? "Nenhum produto encontrado para os filtros informados."
                    : "";
        }
    }


    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterProducts);
    }

    if (situationFilter) {
        situationFilter.addEventListener("change", filterProducts);
    }

});