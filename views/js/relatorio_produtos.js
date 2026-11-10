document.addEventListener("DOMContentLoaded", () => {
    const botaoGerar = document.querySelector("#generateProductReport");
    const botaoLimparFiltros = document.querySelector("#clearProductReportFilters");
    const filtroNome = document.querySelector("#filterProductName");
    const filtroCategoria = document.querySelector("#filterProductCategory");
    const corpoTabela = document.querySelector("#productReportRows");
    const status = document.querySelector("#productReportStatus");
    let produtosRecebidos = null;
    let requisicaoEmAndamento = false;
    const colunas = [
        ["nome", "Nome"],
        ["sku", "SKU"],
        ["codigo_barras", "Código de barras"],
        ["categoria", "Categoria"],
        ["quantidade_estoque", "Quantidade em estoque"]
    ];

    function renderizarEstado(mensagem, tipo = "") {
        status.textContent = mensagem;
        status.classList.toggle("is-error", tipo === "erro");
    }

    function renderizarPlaceholder(mensagem) {
        const linha = document.createElement("tr");
        linha.className = "report-placeholder-row";
        const celula = document.createElement("td");
        celula.colSpan = colunas.length;
        celula.textContent = mensagem;
        linha.appendChild(celula);
        corpoTabela.replaceChildren(linha);
    }

    function atualizarCategorias(produtos) {
        const categoriaSelecionada = filtroCategoria.value;
        const categorias = [...new Set(
            produtos
                .map((produto) => produto && produto.categoria)
                .filter((categoria) => typeof categoria === "string" && categoria.trim() !== "")
        )].sort((a, b) => a.localeCompare(b, "pt-BR"));
        const opcoes = [new Option("Todas as categorias", "")];

        categorias.forEach((categoria) => {
            opcoes.push(new Option(categoria, categoria));
        });

        filtroCategoria.replaceChildren(...opcoes);
        if (categorias.includes(categoriaSelecionada)) {
            filtroCategoria.value = categoriaSelecionada;
        }
    }

    function aplicarFiltros() {
        if (!Array.isArray(produtosRecebidos)) {
            return;
        }

        if (produtosRecebidos.length === 0) {
            renderizarPlaceholder("Nenhum produto encontrado.");
            renderizarEstado("Nenhum produto encontrado.");
            return;
        }

        const consultaNome = filtroNome.value.trim().toLocaleLowerCase("pt-BR");
        const categoriaSelecionada = filtroCategoria.value;
        const produtosFiltrados = produtosRecebidos.filter((produto) => {
            const nome = String((produto && produto.nome) ?? "").toLocaleLowerCase("pt-BR");
            const correspondeNome = !consultaNome || nome.includes(consultaNome);
            const correspondeCategoria = !categoriaSelecionada
                || (produto && produto.categoria) === categoriaSelecionada;
            return correspondeNome && correspondeCategoria;
        });

        if (produtosFiltrados.length === 0) {
            renderizarPlaceholder("Nenhum produto corresponde aos filtros selecionados.");
            renderizarEstado("Nenhum produto corresponde aos filtros selecionados.");
            return;
        }

        const linhas = produtosFiltrados.map((produto) => {
            const linha = document.createElement("tr");
            colunas.forEach(([campo]) => {
                const celula = document.createElement("td");
                const valor = produto && produto[campo];
                celula.textContent = valor === null || valor === undefined || valor === ""
                    ? "-"
                    : String(valor);
                linha.appendChild(celula);
            });
            return linha;
        });

        corpoTabela.replaceChildren(...linhas);
        const filtrosAtivos = Boolean(consultaNome || categoriaSelecionada);
        const mensagem = filtrosAtivos
            ? `Exibindo ${produtosFiltrados.length} de ${produtosRecebidos.length} produto(s) após filtros locais.`
            : `${produtosRecebidos.length} produto(s) no relatório.`;
        renderizarEstado(mensagem);
    }

    botaoGerar.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("relatorio-produtos:gerar", {
            detail: { filtros: {} }
        }));
    });

    document.addEventListener("relatorio-produtos:gerar", async () => {
        if (requisicaoEmAndamento) {
            return;
        }

        requisicaoEmAndamento = true;
        document.dispatchEvent(new CustomEvent("relatorio-produtos:carregando"));

        try {
            const resposta = await fetch("/api/relatorio/produtos", {
                method: "GET",
                headers: { Accept: "application/json" },
                credentials: "same-origin"
            });

            if (!resposta.ok) {
                const mensagem = resposta.status === 401
                    ? "Acesso não autenticado. Faça login para gerar o relatório."
                    : resposta.status === 403
                        ? "Acesso negado. Apenas Administradores podem gerar o relatório."
                        : "Não foi possível gerar o relatório.";
                document.dispatchEvent(new CustomEvent("relatorio-produtos:erro", {
                    detail: mensagem
                }));
                return;
            }

            const produtos = await resposta.json();
            if (!Array.isArray(produtos)) {
                document.dispatchEvent(new CustomEvent("relatorio-produtos:erro", {
                    detail: "A resposta do relatório possui formato inválido."
                }));
                return;
            }

            document.dispatchEvent(new CustomEvent("relatorio-produtos:resultado", {
                detail: produtos
            }));
        } catch {
            document.dispatchEvent(new CustomEvent("relatorio-produtos:erro", {
                detail: "Não foi possível conectar ao serviço de relatórios."
            }));
        } finally {
            requisicaoEmAndamento = false;
            botaoGerar.disabled = false;
        }
    });

    filtroNome.addEventListener("input", aplicarFiltros);
    filtroCategoria.addEventListener("change", aplicarFiltros);

    botaoLimparFiltros.addEventListener("click", () => {
        filtroNome.value = "";
        filtroCategoria.value = "";
        aplicarFiltros();
    });

    document.addEventListener("relatorio-produtos:carregando", () => {
        botaoGerar.disabled = true;
        renderizarEstado("Carregando relatório...");
    });

    document.addEventListener("relatorio-produtos:resultado", (event) => {
        botaoGerar.disabled = false;
        if (!Array.isArray(event.detail)) {
            renderizarEstado("A resposta do relatório possui formato inválido.", "erro");
            return;
        }

        produtosRecebidos = event.detail;
        atualizarCategorias(produtosRecebidos);
        aplicarFiltros();
    });

    document.addEventListener("relatorio-produtos:erro", (event) => {
        botaoGerar.disabled = false;
        const mensagem = typeof event.detail === "string"
            ? event.detail
            : event.detail && event.detail.message;
        renderizarEstado(mensagem || "Não foi possível gerar o relatório.", "erro");
    });
});
