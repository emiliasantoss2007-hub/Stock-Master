document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;
    async function consultarProdutosParaCategorias() {
        const resposta = await fetch("/api/relatorios/estoque", {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "same-origin"
        });
        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso || !resultado.dados?.itens) {
            throw new Error("Não foi possível carregar as categorias dos produtos.");
        }

        return resultado.dados.itens;
    }

    async function consultarProdutosCadastrados() {
        const resposta = await fetch("/api/relatorio/produtos", {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "same-origin"
        });
        const resultado = await resposta.json();

        if (!resposta.ok || !Array.isArray(resultado)) {
            throw new Error(resultado.message || "Não foi possível gerar o relatório de produtos.");
        }

        return resultado;
    }

    // ========================================
    // ELEMENTOS DO FORMULÁRIO
    // ========================================

    const formulario = document.querySelector("#formRelatorio");
    const tipoRelatorio = document.querySelector("#tipoRelatorio");
    const filtroCategoria = document.querySelector("#filtroCategoria");
    const filtrosEstoque = document.querySelector("#filtrosEstoque");
    const filtroBuscaEstoque = document.querySelector("#filtroBuscaEstoque");
    const apenasZerados = document.querySelector("#apenasZerados");
    const dataInicio = document.querySelector("#dataInicio");
    const dataFim = document.querySelector("#dataFim");
    const mensagemArea = document.querySelector("#mensagemArea");
    
    const visualizarRelatorioArea = document.querySelector("#visualizarRelatorioArea");
    const btnVisualizarRelatorio = document.querySelector("#btnVisualizarRelatorio");

    // ========================================
   // EXIBIR FILTROS CONFORME O TIPO DE RELATÓRIO
  // ========================================

function atualizarFiltros() {
    const estoqueSelecionado = tipoRelatorio.value === "estoque";
    const movimentacoesSelecionadas = tipoRelatorio.value === "movimentacoes";
    const produtosSelecionados = tipoRelatorio.value === "produtos";

    filtrosEstoque.style.display = estoqueSelecionado ? "block" : "none";

    if (estoqueSelecionado || movimentacoesSelecionadas) {
    carregarCategoriasEstoque();
   }
    if (produtosSelecionados) {
        carregarCategoriasProdutos();
    }
}

tipoRelatorio.addEventListener("change", atualizarFiltros);

atualizarFiltros();

async function carregarCategoriasEstoque() {
    try {
        const produtosEstoque = await consultarProdutosParaCategorias();
        const categorias = [
            ...new Set(
                produtosEstoque
                    .map((produto) => produto.categoria)
                    .filter((categoria) => categoria)
            )
        ];

        const categoriaSelecionada = filtroCategoria.value;

        const opcoes = [new Option("Todas", "")];

        categorias.sort((a, b) => a.localeCompare(b, "pt-BR"));

        categorias.forEach((categoria) => {
            opcoes.push(new Option(categoria, categoria));
        });

        filtroCategoria.replaceChildren(...opcoes);

        if (categorias.includes(categoriaSelecionada)) {
            filtroCategoria.value = categoriaSelecionada;
        }

    } catch (erro) {
        console.error("Erro ao carregar categorias do estoque:", erro);
    }
}

async function carregarCategoriasProdutos() {
    try {
        const produtosCadastrados = await consultarProdutosCadastrados();
        const categorias = [...new Set(
            produtosCadastrados
                .map((produto) => produto.categoria)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, "pt-BR"));
        const categoriaSelecionada = filtroCategoria.value;
        const opcoes = [new Option("Todas", "")];

        categorias.forEach((categoria) => opcoes.push(new Option(categoria, categoria)));
        filtroCategoria.replaceChildren(...opcoes);

        if (categorias.includes(categoriaSelecionada)) {
            filtroCategoria.value = categoriaSelecionada;
        }
    } catch (erro) {
        console.error("Erro ao carregar categorias dos produtos:", erro);
    }
}

    // ========================================
    // GERAR RELATÓRIO
    // ========================================

    formulario.addEventListener("submit", async (e) => {

        e.preventDefault();

        // Limpa somente a mensagem anterior.
        // NÃO limpa os campos do formulário.
        mensagemArea.innerHTML = "";

        const tipo = tipoRelatorio.value;
        const categoria = filtroCategoria.value;
        const inicio = dataInicio.value;
        const fim = dataFim.value;

        // ========================================
        // VALIDAÇÃO DO TIPO
        // ========================================

        if (!tipo) {

            mensagemArea.innerHTML = `
                <p class="mensagem-erro">
                    Selecione o tipo de relatório.
                </p>
            `;

            return;
        }

        // ========================================
        // VALIDAÇÃO DAS DATAS
        // ========================================

        // Se uma data for preenchida, a outra também
        // precisa ser preenchida.

        if (tipo !== "movimentacoes" && ((inicio && !fim) || (!inicio && fim))) {

            mensagemArea.innerHTML = `
                <p class="mensagem-erro">
                    Preencha a data inicial e a data final,
                    ou deixe as duas em branco.
                </p>
            `;

            return;
        }

        visualizarRelatorioArea.style.display = "none";

        // ========================================
        // DADOS DO RELATÓRIO
        // ========================================

        let dados = [];

        // ========================================
        // RELATÓRIO DE MOVIMENTAÇÕES
        // ========================================

                if (tipo === "movimentacoes") {
            const filtros = new URLSearchParams({ tipo, inicio, fim });
            btnVisualizarRelatorio.href = "visualizar_relatorios.html?" + filtros;
            visualizarRelatorioArea.style.display = "block";
            return;
        }

        if (tipo === "estoque") {
    const busca = filtroBuscaEstoque.value.trim();
    const somenteZerados = apenasZerados.checked;

    const parametros = new URLSearchParams();

    if (busca) {
        parametros.append("busca", busca);
    }

    if (categoria) {
        parametros.append("categoria", categoria);
    }

    if (somenteZerados) {
        parametros.append("apenasZerados", "true");
    }

    try {
        const resposta = await fetch(
            `/api/relatorios/estoque?${parametros.toString()}`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
                credentials: "same-origin"
            }
        );

        if (!resposta.ok) {
            const mensagem = resposta.status === 401
                ? "Acesso não autenticado. Faça login novamente."
                : resposta.status === 403
                    ? "Acesso negado. Apenas administradores podem consultar relatórios."
                    : "Não foi possível gerar o relatório de estoque.";

            mensagemArea.innerHTML = `
                <p class="mensagem-erro">${mensagem}</p>
            `;

            return;
        }

        const resultado = await resposta.json();

        if (!resultado.sucesso || !resultado.dados) {
            mensagemArea.innerHTML = `
                <p class="mensagem-erro">
                    Não foi possível obter os dados do estoque.
                </p>
            `;

            return;
        }

        dados = resultado.dados.itens.map((produto) => ({
            SKU: produto.sku,
            Produto: produto.nome,
            Categoria: produto.categoria,
            "Quantidade em estoque": produto.quantidadeEstoque,
            "Valor unitário": `R$ ${produto.valorUnitario.toFixed(2).replace(".", ",")}`,
            "Valor total em estoque": `R$ ${produto.valorEstoque.toFixed(2).replace(".", ",")}`
        }));

    } catch (erro) {
        console.error("Erro ao consultar relatório de estoque:", erro);

        mensagemArea.innerHTML = `
            <p class="mensagem-erro">
                Não foi possível conectar ao serviço de relatórios.
            </p>
        `;

        return;
    }
}
        // ========================================
        // RELATÓRIO DE PRODUTOS CADASTRADOS
        // ========================================

        else if (tipo === "produtos") {
            try {
                const produtosCadastrados = await consultarProdutosCadastrados();
                dados = produtosCadastrados
                    .filter((produto) => !categoria || produto.categoria === categoria)
                    .map((produto) => ({
                        SKU: produto.sku,
                        Produto: produto.nome,
                        Categoria: produto.categoria,
                        "Código de barras": produto.codigo_barras || "-"
                    }));
            } catch (erro) {
                console.error("Erro ao consultar relatório de produtos:", erro);
                mensagemArea.innerHTML = `
                    <p class="mensagem-erro">
                        ${erro.message || "Não foi possível gerar o relatório de produtos."}
                    </p>
                `;
                return;
            }
        }

        // ========================================
        // TÍTULO DO RELATÓRIO
        // ========================================

        const nomesRelatorios = {

            movimentacoes:
                "Relatório de Movimentações de Estoque",

            estoque:
                "Relatório de Estoque Atual",

            produtos:
                "Relatório de Produtos Cadastrados"
        };

        // ========================================
        // MENSAGEM DE SUCESSO
        // ========================================

        mensagemArea.innerHTML = `
            <div class="mensagem-sucesso">
                <p>
                    ${nomesRelatorios[tipo]} gerado com sucesso!
                    Foram encontrados ${dados.length} registro(s).
                </p>
            </div>
        `;

        // ========================================
        // BOTÃO VISUALIZAR RELATÓRIO
        // ========================================

        const parametrosVisualizacao = new URLSearchParams({
    tipo,
    categoria,
    inicio,
    fim,
    origem: "adm"
});

if (tipo === "estoque") {
    parametrosVisualizacao.set("busca", filtroBuscaEstoque.value.trim());
    parametrosVisualizacao.set(
        "apenasZerados",
        String(apenasZerados.checked)
    );
}

btnVisualizarRelatorio.href =
    `visualizar_relatorios.html?${parametrosVisualizacao.toString()}`;

        visualizarRelatorioArea.style.display = "block";

        // ========================================
        // VISUALIZAÇÃO NO CONSOLE
        // ========================================

        console.log("Relatório gerado:", {

            tipo: tipo,

            titulo: nomesRelatorios[tipo],

            filtros: {
                categoria: categoria || "Todas",
                dataInicio: inicio || "-",
                dataFim: fim || "-"
            },

            geradoEm: new Date().toLocaleString("pt-BR"),

            geradoPor: username.textContent,

            dados: dados
        });

    });

    // ========================================
    // LIMPAR FILTROS
    // ========================================

    formulario.addEventListener("reset", () => {

        mensagemArea.innerHTML = "";

        visualizarRelatorioArea.style.display = "none";

        btnVisualizarRelatorio.href = "#";
    });
});
