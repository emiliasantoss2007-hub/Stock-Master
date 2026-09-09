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
    // DADOS FICTÍCIOS DO PROTÓTIPO
    // ========================================

    const produtos = {

        "1": {
            nome: "Tela LCD 6.5",
            categoria: "Tela",
            sku: "SM-TEL-001",
            codigoBarras: "7891234560012",
            valor: "289.90",
            quantidade: "12",
            descricao: "Tela LCD para smartphones compatíveis."
        },

        "2": {
            nome: "Bateria 5000mAh",
            categoria: "Bateria",
            sku: "SM-BAT-002",
            codigoBarras: "7891234560029",
            valor: "119.90",
            quantidade: "25",
            descricao: "Bateria de reposição para aparelhos compatíveis."
        },

        "3": {
            nome: "Conector USB-C",
            categoria: "Conector",
            sku: "SM-CON-003",
            codigoBarras: "7891234560036",
            valor: "39.90",
            quantidade: "8",
            descricao: "Conector USB-C para manutenção de dispositivos."
        }

    };


    // ========================================
    // CARREGAR PRODUTO
    // ========================================

    const produto = produtos[idProduto] || produtos["1"];

    document.querySelector("#nome").value = produto.nome;
    document.querySelector("#categoria").value = produto.categoria;
    document.querySelector("#sku").value = produto.sku;
    document.querySelector("#codigoBarras").value = produto.codigoBarras;
    document.querySelector("#valor").value = produto.valor;
    document.querySelector("#quantidade").value = produto.quantidade;
    document.querySelector("#descricao").value = produto.descricao;


    // ========================================
    // FORMULÁRIO
    // ========================================

    const form = document.querySelector("#formEditarProduto");
    const formMessage = document.querySelector("#formMessage");


    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const nome = document.querySelector("#nome");
        const categoria = document.querySelector("#categoria");
        const valor = document.querySelector("#valor");

        let formValid = true;


        // Limpa erros

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

        if (!valor.value || Number(valor.value) < 0) {

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


        // ========================================
        // SUCESSO VISUAL
        // ========================================

        formMessage.textContent =
            "Produto atualizado com sucesso!";

        formMessage.className =
            "product-form-message product-form-message-success";

    });


    // ========================================
    // EXCLUIR — SOMENTE VISUAL
    // ========================================

    const btnExcluir = document.querySelector("#btnExcluir");

    btnExcluir.addEventListener("click", () => {

        if (origem === "tecnico") {

            formMessage.textContent =
                "Apenas o Administrador pode excluir produtos.";

            formMessage.className =
                "product-form-message product-form-message-error";

            return;
        }


        const confirmar = window.confirm(
            "Deseja realmente excluir este produto?"
        );


        if (confirmar) {

            formMessage.textContent =
                "Produto excluído com sucesso.";

            formMessage.className =
                "product-form-message product-form-message-success";

        }

    });

});