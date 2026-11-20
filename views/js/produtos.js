
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

        dashboardLink.href = "dashboard_adm.html";
        breadcrumbLink.href = "dashboard_adm.html";

        cadastrarProdutoLink.href = "cadastrar_produto.html?origem=adm";
        entradaLink.href = "entrada_estoque.html?origem=adm";

        userRole.textContent = "Administrador";
        username.textContent = "admin.stockmaster";

        produtosMenuText.textContent = "Produtos";
        breadcrumbPage.textContent = "Produtos";

        usuariosLink.style.display = "";
        expurgoLink.style.display = "";
        relatoriosLink.style.display = "";
    }


    // ========================================
    // CONFIGURAÇÃO DO TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        dashboardLink.href = "dashboard_tec.html";
        breadcrumbLink.href = "dashboard_tec.html";

        cadastrarProdutoLink.href = "cadastrar_produto.html?origem=tecnico";
        entradaLink.href = "entrada_estoque.html?origem=tecnico";

        userRole.textContent = "Técnico";
        username.textContent = "tecnico.stockmaster";

        produtosMenuText.textContent = "Consultar produtos";
        breadcrumbPage.textContent = "Produtos";

        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";
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
    // ELEMENTOS DO MODAL DE EXCLUSÃO
    // ========================================

    const deleteModal =
        document.querySelector("#deleteProductModal");

    const deleteProductName =
        document.querySelector("#deleteProductName");

    const deleteProductSku =
        document.querySelector("#deleteProductSku");

    const deleteProductId =
        document.querySelector("#deleteProductId");

    const deleteProductFeedback =
        document.querySelector("#deleteProductFeedback");

    const cancelDeleteProduct =
        document.querySelector("#cancelDeleteProduct");

    const confirmDeleteProduct =
        document.querySelector("#confirmDeleteProduct");

    let selectedProductId = null;
    let selectedProductRow = null;


    // ========================================
    // MENSAGENS DO MODAL
    // ========================================

    function setDeleteFeedback(message, type = "") {

        deleteProductFeedback.textContent = message;

        deleteProductFeedback.className = type
            ? `product-feedback product-feedback-${type}`
            : "product-feedback";
    }


    // ========================================
    // ABRIR MODAL
    // ========================================

    function openDeleteModal(row) {

        selectedProductRow = row;
        selectedProductId = row.dataset.productId;

        deleteProductName.textContent =
            row.querySelector(".product-cell strong").textContent;

        deleteProductSku.textContent =
            row.querySelector("td:nth-child(2)").textContent;

        deleteProductId.textContent = selectedProductId;

        setDeleteFeedback("");

        confirmDeleteProduct.disabled = false;

        deleteModal.hidden = false;

        document.body.classList.add("product-modal-open");
    }


    // ========================================
    // FECHAR MODAL
    // ========================================

    function closeDeleteModal() {

        deleteModal.hidden = true;

        document.body.classList.remove("product-modal-open");

        selectedProductId = null;
        selectedProductRow = null;
    }


    // ========================================
    // BOTÕES DE EXCLUSÃO
    // ========================================

    const deleteButtons =
        document.querySelectorAll(".product-action-delete");

    if (origem === "tecnico") {

        deleteButtons.forEach((button) => {
            button.hidden = true;
        });

    }

    deleteButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const row = button.closest("tr");

            if (row) {
                openDeleteModal(row);
            }

        });

    });


    // ========================================
    // BOTÃO CANCELAR
    // ========================================

    cancelDeleteProduct.addEventListener(
        "click",
        closeDeleteModal
    );


    // ========================================
    // FECHAR AO CLICAR FORA DO MODAL
    // ========================================

    deleteModal.addEventListener("click", (event) => {

        if (event.target === deleteModal) {
            closeDeleteModal();
        }

    });


    // ========================================
    // CONFIRMAR EXCLUSÃO
    // ========================================

    confirmDeleteProduct.addEventListener("click", async () => {

        if (!selectedProductId || !selectedProductRow) {
            return;
        }

        const token =
            sessionStorage.getItem("stockmaster.accessToken");

        if (!token) {

            setDeleteFeedback(
                "Sessão expirada. Faça login novamente.",
                "error"
            );

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

            selectedProductRow.remove();

            rows = rows.filter(
                (row) => row !== selectedProductRow
            );

            closeDeleteModal();

            filterProducts();

            productsMessage.textContent =
                data.mensagem || "Produto excluído com sucesso.";

        } catch (erro) {

            setDeleteFeedback(erro.message, "error");

        } finally {

            confirmDeleteProduct.disabled = false;

        }

    });


    // ========================================
    // FILTRAR PRODUTOS
    // ========================================

    function filterProducts() {

        const search =
            searchInput.value.trim().toLowerCase();

        const category =
            categoryFilter.value;

        const situation =
            situationFilter.value;

        let visibleRows = 0;

        rows.forEach((row) => {

            const matchesSearch =
                !search ||
                row.dataset.search.includes(search);

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

        productsCount.textContent =
            `${visibleRows} produto(s)`;

        productsMessage.textContent =
            visibleRows === 0
                ? "Nenhum produto encontrado para os filtros informados."
                : "";
    }


    // ========================================
    // EVENTOS DOS FILTROS
    // ========================================

    searchInput.addEventListener(
        "input",
        filterProducts
    );

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

    situationFilter.addEventListener(
        "change",
        filterProducts
    );

});
