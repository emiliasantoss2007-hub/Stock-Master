document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // IDENTIFICAÇÃO DA ORIGEM
    // ========================================

    const params = new URLSearchParams(window.location.search);

    const origem = params.get("origem");
    const idProduto = params.get("id");


    // ========================================
    // ELEMENTOS DA NAVEGAÇÃO
    // ========================================

    const dashboardLink = document.querySelector("#dashboardLink");
    const breadcrumbLink = document.querySelector("#breadcrumbLink");

    const produtosLink = document.querySelector("#produtosLink");
    const cancelarProdutoLink = document.querySelector("#cancelarProdutoLink");

    const usuariosLink = document.querySelector("#usuariosLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");

    const produtosMenuText = document.querySelector("#produtosMenuText");
    const breadcrumbProdutosLink = document.querySelector("#breadcrumbProdutosLink");

    const userRole = document.querySelector("#userRole");
    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");


    // ========================================
    // CONFIGURAÇÃO DO ADMINISTRADOR
    // ========================================

    if (origem !== "tecnico") {

        dashboardLink.href = "dashboard_adm.html";
        breadcrumbLink.href = "dashboard_adm.html";

        produtosLink.href = "produtos.html?origem=adm";
        breadcrumbProdutosLink.href = "produtos.html?origem=adm";
        cancelarProdutoLink.href = "produtos.html?origem=adm";

        produtosMenuText.textContent = "Produtos";

        userRole.textContent = "Administrador";
        username.textContent = "admin.stockmaster";
        userAvatar.textContent = "AD";

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

        produtosLink.href = "produtos.html?origem=tecnico";
        breadcrumbProdutosLink.href = "produtos.html?origem=tecnico";
        cancelarProdutoLink.href = "produtos.html?origem=tecnico";

        produtosMenuText.textContent = "Consultar produtos";

        userRole.textContent = "Técnico";
        username.textContent = "tecnico.stockmaster";
        userAvatar.textContent = "TC";

        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";
    }

    // ========================================
// ELEMENTOS DO FORMULÁRIO
// ========================================

const form = document.querySelector("#formEditarProduto");
const formMessage = document.querySelector("#formMessage");
const btnExcluir = document.querySelector("#btnExcluir");


    // ========================================
// CARREGAR PRODUTO DO BANCO DE DADOS
// ========================================

async function carregarProduto() {

    if (!idProduto || !/^\d+$/.test(idProduto)) {
        formMessage.textContent = "ID do produto inválido.";
        formMessage.className =
            "product-form-message product-form-message-error";
        return;
    }

    try {

        const token = sessionStorage.getItem("stockmaster.accessToken");
        const resposta = await fetch(`/api/produtos/${idProduto}`, {method: "GET", headers: {
            "Accept": "application/json", "Authorization": `Bearer ${token}`}});

        if (!resposta.ok) {const erro = await resposta.text();
            console.error("Resposta da API:", erro);
            throw new Error(`Erro ${resposta.status} ao buscar produto.`);}
        
        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.success) {
            throw new Error(resultado.message || "Produto não encontrado.");
        }

        const produto = resultado.data;

        document.querySelector("#nome").value = produto.nome || "";
        document.querySelector("#categoria").value = produto.categoria || "";
        document.querySelector("#sku").value = produto.sku || "";
        document.querySelector("#codigoBarras").value = produto.codigo_barras || "";
        document.querySelector("#valor").value = produto.valor ?? "";
        document.querySelector("#quantidade").value = produto.quantidade_estoque ?? "";
        document.querySelector("#descricao").value = produto.descricao || "";

    } catch (erro) {

        console.error("Erro ao carregar produto:", erro);

        formMessage.textContent = erro.message ||
            "Não foi possível carregar os dados do produto.";

        formMessage.className =
            "product-form-message product-form-message-error";
    }
}

carregarProduto();

// ========================================
// FORMULÁRIO DE EDIÇÃO
// ========================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const nome = document.querySelector("#nome");
    const categoria = document.querySelector("#categoria");
    const valor = document.querySelector("#valor");

    const codigoBarras = document.querySelector("#codigoBarras");
    const descricao = document.querySelector("#descricao");

    let formValid = true;

    // Limpa erros anteriores
    document.querySelector("#nomeError").textContent = "";
    document.querySelector("#categoriaError").textContent = "";
    document.querySelector("#valorError").textContent = "";

    nome.classList.remove("field-invalid");
    categoria.classList.remove("field-invalid");
    valor.classList.remove("field-invalid");

    // Validação do nome
    if (!nome.value.trim()) {
        document.querySelector("#nomeError").textContent =
            "Informe o nome do produto.";

        nome.classList.add("field-invalid");
        formValid = false;
    }

    // Validação da categoria
    if (!categoria.value) {
        document.querySelector("#categoriaError").textContent =
            "Selecione uma categoria.";

        categoria.classList.add("field-invalid");
        formValid = false;
    }

    // Validação do valor
    if (!valor.value || !Number.isFinite(Number(valor.value)) || Number(valor.value) < 0) {
        document.querySelector("#valorError").textContent =
            "Informe um valor válido.";

        valor.classList.add("field-invalid");
        formValid = false;
    }

    if (!formValid) {
        formMessage.textContent =
            "Corrija os campos destacados antes de continuar.";

        formMessage.className =
            "product-form-message product-form-message-error";

        return;
    }

    // Verifica o ID
    if (!idProduto || !/^\d+$/.test(idProduto)) {
        formMessage.textContent = "ID do produto inválido.";

        formMessage.className =
            "product-form-message product-form-message-error";

        return;
    }

    // Envia alterações ao backend
    try {

        const token = sessionStorage.getItem("stockmaster.accessToken");

        const resposta = await fetch(`/api/produtos/${idProduto}`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: nome.value.trim(),
                categoria: categoria.value,
                codigoBarras: codigoBarras.value.trim(),
                valor: Number(valor.value),
                descricao: descricao.value.trim()
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.success) {
            throw new Error(resultado.message || "Não foi possível atualizar o produto.");
        }

        formMessage.textContent = "Produto atualizado com sucesso!";

        formMessage.className =
            "product-form-message product-form-message-success";
        
        setTimeout(() => {window.location.href = `produtos.html?origem=${origem || "adm"}`;}, 1000);

    } catch (erro) {

        console.error("Erro ao atualizar produto:", erro);

        formMessage.textContent = erro.message ||
            "Erro ao salvar as alterações.";

        formMessage.className =
            "product-form-message product-form-message-error";
    }

});

});