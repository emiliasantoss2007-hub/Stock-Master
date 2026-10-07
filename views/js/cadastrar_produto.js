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
    const usuariosLink = document.querySelector("#usuariosLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");

    const produtosLink = document.querySelector("#produtosLink");
    const produtosMenuText = document.querySelector("#produtosMenuText");
    const cancelarProdutoLink = document.querySelector("#cancelarProdutoLink");


    // ========================================
    // CONFIGURAÇÃO DA SIDEBAR
    // ========================================

    if (origem === "tecnico") {

        // Sidebar do técnico
        dashboardLink.href = "dashboard_tec.html";

        produtosLink.href = "produtos.html?origem=tecnico";

        cancelarProdutoLink.href = "produtos.html?origem=tecnico";

        produtosMenuText.textContent = "Consultar produtos";

        // Esconde apenas os itens exclusivos do administrador
        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";

    } else {

        // Sidebar do administrador
        dashboardLink.href = "dashboard_adm.html";

        produtosLink.href = "produtos.html?origem=adm";

        cancelarProdutoLink.href = "produtos.html?origem=adm";

        produtosMenuText.textContent = "Produtos";

        usuariosLink.style.display = "";
        expurgoLink.style.display = "";
        relatoriosLink.style.display = "";
    }


    // ========================================
    // FORMULÁRIO
    // ========================================

    const productForm = document.querySelector("#productForm");
    const formMessage = document.querySelector("#formMessage");

    const fields = {
        nomeProduto: document.querySelector("#nomeProduto"),
        sku: document.querySelector("#sku"),
        categoria: document.querySelector("#categoria"),
        valorUnitario: document.querySelector("#valorUnitario"),
        quantidadeInicial: document.querySelector("#quantidadeInicial"),
        estoqueMinimo: document.querySelector("#estoqueMinimo"),
        descricao: document.querySelector("#descricao")
    };

    const errors = {
        nomeProduto: document.querySelector("#nomeProdutoError"),
        sku: document.querySelector("#skuError"),
        categoria: document.querySelector("#categoriaError"),
        valorUnitario: document.querySelector("#valorUnitarioError"),
        quantidadeInicial: document.querySelector("#quantidadeInicialError"),
        estoqueMinimo: document.querySelector("#estoqueMinimoError"),
        descricao: document.querySelector("#descricaoError")
    };


    // ========================================
    // VALIDAÇÃO DO FORMULÁRIO
    // ========================================

    productForm.addEventListener("submit", (event) => {

        event.preventDefault();

        let formValid = true;

        const valor = Number(fields.valorUnitario.value);
        const quantidade = Number(fields.quantidadeInicial.value);
        const minimo = Number(fields.estoqueMinimo.value);


        // Limpa mensagens anteriores
        Object.values(errors).forEach((error) => {
            error.textContent = "";
        });


        // Remove destaque dos campos
        Object.values(fields).forEach((field) => {
            field.classList.remove("field-invalid");
        });


        // Nome
        if (!fields.nomeProduto.value.trim()) {

            errors.nomeProduto.textContent =
                "Informe o nome do produto.";

            fields.nomeProduto.classList.add("field-invalid");

            formValid = false;
        }


        // SKU
        if (!fields.sku.value.trim()) {

            errors.sku.textContent =
                "Informe o SKU do produto.";

            fields.sku.classList.add("field-invalid");

            formValid = false;
        }


        // Categoria
        if (!fields.categoria.value) {

            errors.categoria.textContent =
                "Selecione uma categoria.";

            fields.categoria.classList.add("field-invalid");

            formValid = false;
        }


        // Valor
        if (!fields.valorUnitario.value || valor < 0) {

            errors.valorUnitario.textContent =
                "Informe um valor unitário válido.";

            fields.valorUnitario.classList.add("field-invalid");

            formValid = false;
        }


        // Quantidade
        if (
            !fields.quantidadeInicial.value ||
            quantidade < 0 ||
            !Number.isInteger(quantidade)
        ) {

            errors.quantidadeInicial.textContent =
                "Informe uma quantidade inteira válida.";

            fields.quantidadeInicial.classList.add("field-invalid");

            formValid = false;
        }


        // Estoque mínimo
        if (
            !fields.estoqueMinimo.value ||
            minimo < 0 ||
            !Number.isInteger(minimo)
        ) {

            errors.estoqueMinimo.textContent =
                "Informe um limite mínimo inteiro válido.";

            fields.estoqueMinimo.classList.add("field-invalid");

            formValid = false;
        }


        // Se houver erro
        if (!formValid) {

            formMessage.textContent =
                "Corrija os campos destacados antes de continuar.";

            formMessage.className =
                "product-form-message product-form-message-error";

            return;
        }


        // Cadastro realizado
        formMessage.textContent =
            "Produto cadastrado com sucesso. Retornando à consulta...";

        formMessage.className =
            "product-form-message product-form-message-success";


        // ========================================
        // RETORNO PARA PRODUTOS
        // ========================================

        window.setTimeout(() => {

            const destino = origem === "tecnico"
                ? "produtos.html?origem=tecnico&cadastro=sucesso"
                : "produtos.html?origem=adm&cadastro=sucesso";

            window.location.href = destino;

        }, 900);

    });

});