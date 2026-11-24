document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;

    // ========================================
    // PARÂMETROS DA URL
    // ========================================

    const params = new URLSearchParams(window.location.search);

    const tipo = params.get("tipo");
    const categoria = params.get("categoria") || "";
    const dataInicio = params.get("inicio") || "";
    const busca = params.get("busca") || "";
    const apenasZerados = params.get("apenasZerados") === "true";
    const dataFim = params.get("fim") || "";


    // ========================================
    // ACESSO DO ADMINISTRADOR
    // ========================================



    // ========================================
    // ELEMENTOS DA PÁGINA
    // ========================================

    const titulo = document.querySelector("#relatorioTitulo");
    const meta = document.querySelector("#relatorioMeta");
    const thead = document.querySelector("#relatorioCabecalho");
    const tbody = document.querySelector("#relatorioCorpo");
    const mensagemArea = document.querySelector("#mensagemArea");

    const btnPdf = document.querySelector("#btnExportarPdf");
    const btnExcel = document.querySelector("#btnExportarExcel");


    // ========================================
    // PRODUTOS FICTÍCIOS
    // ========================================

    const produtos = [
        {
            id: 1,
            nome: "Display LCD 6.1",
            sku: "SKU-001",
            categoria: "Telas",
            quantidade: 32,
            valor: 250.00,
            descricao: "Peça para manutenção"
        },
        {
            id: 2,
            nome: "Bateria modelo A20",
            sku: "SKU-002",
            categoria: "Baterias",
            quantidade: 45,
            valor: 120.00,
            descricao: "Componente interno"
        },
        {
            id: 3,
            nome: "Conector USB-C",
            sku: "SKU-003",
            categoria: "Conectores",
            quantidade: 3,
            valor: 35.00,
            descricao: "Peça para manutenção"
        }
    ];


    const DATA_INICIO_PADRAO_MOVIMENTACOES = "1000-01-01";
    const DATA_FIM_PADRAO_MOVIMENTACOES = "9999-12-30";

    async function consultarMovimentacoes() {
        try {
            const parametros = new URLSearchParams({
                dataInicio: dataInicio || DATA_INICIO_PADRAO_MOVIMENTACOES,
                dataFim: dataFim || DATA_FIM_PADRAO_MOVIMENTACOES
            });
            const resposta = await fetch(
                `/api/relatorios/movimentacoes?${parametros.toString()}`,
                {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    credentials: "same-origin"
                }
            );
            const resultado = await resposta.json();
            const semResultados = resposta.status === 404 &&
                resultado.data?.total_registros === 0;

            if ((!resposta.ok && !semResultados) || (!resultado.success && !semResultados)) {
                throw new Error(resultado.message || "Não foi possível consultar as movimentações.");
            }

            let registros = resultado.data?.registros || [];
            if (categoria && registros.length) {
                const respostaEstoque = await fetch("/api/relatorios/estoque", {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    credentials: "same-origin"
                });
                const resultadoEstoque = await respostaEstoque.json();

                if (!respostaEstoque.ok || !resultadoEstoque.sucesso || !resultadoEstoque.dados?.itens) {
                    throw new Error("Não foi possível aplicar o filtro de categoria.");
                }

                const categoriasPorProduto = new Map(
                    resultadoEstoque.dados.itens.map((produto) => [
                        Number(produto.idProduto),
                        produto.categoria
                    ])
                );
                registros = registros.filter((movimentacao) =>
                    categoriasPorProduto.get(Number(movimentacao.produto?.id_produto)) === categoria
                );
            }

            return registros.map((movimentacao) => {
                const data = new Date(movimentacao.data_movimentacao);
                const usuario = movimentacao.usuario || {};

                return {
                    Data: Number.isNaN(data.getTime())
                        ? "-"
                        : `${data.toLocaleDateString("pt-BR")} ${data.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}`,
                    Produto: movimentacao.produto?.nome || "Produto removido",
                    Tipo: movimentacao.tipo_movimentacao || "-",
                    Quantidade: movimentacao.quantidade,
                    Responsável: usuario.nome || usuario.login || "-",
                    Justificativa: movimentacao.justificativa || "-"
                };
            });
        } catch (erro) {
            mensagemArea.className = "mensagem-erro";
            mensagemArea.textContent = erro.message || "Não foi possível consultar as movimentações.";
            return null;
        }
    }


    // ========================================
    // TÍTULOS
    // ========================================

    const nomesRelatorios = {
        movimentacoes: "Relatório de Movimentações de Estoque",
        estoque: "Relatório de Estoque Atual",
        produtos: "Relatório de Produtos Cadastrados"
    };


    // ========================================
    // VERIFICAR RELATÓRIO
    // ========================================

    if (!tipo || !nomesRelatorios[tipo]) {

        titulo.textContent = "Nenhum relatório gerado";

        mensagemArea.innerHTML = `
            <p class="mensagem-erro">
                Volte para a Central de Relatórios
                e gere um novo relatório.
            </p>
        `;

        return;
    }


    // ========================================
    // TÍTULO
    // ========================================

    titulo.textContent = nomesRelatorios[tipo];


    // ========================================
    // MONTAR DADOS
    // ========================================

    let dados = [];


    // ========================================
    // MOVIMENTAÇÕES
    // ========================================

    if (tipo === "movimentacoes") {
        dados = await consultarMovimentacoes();
        if (dados === null) return;
    }


    // ========================================
    // ESTOQUE ATUAL
    // ========================================
else if (tipo === "estoque") {

    const parametros = new URLSearchParams();

    if (busca) {
        parametros.append("busca", busca);
    }

    if (categoria) {
        parametros.append("categoria", categoria);
    }

    if (apenasZerados) {
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
            mensagemArea.innerHTML = `
                <p class="mensagem-erro">
                    Não foi possível consultar o relatório de estoque.
                </p>
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
            "Valor unitário": `R$ ${Number(produto.valorUnitario).toFixed(2).replace(".", ",")}`,
            "Valor total em estoque": `R$ ${Number(produto.valorEstoque).toFixed(2).replace(".", ",")}`
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
    // PRODUTOS CADASTRADOS
    // ========================================

    else if (tipo === "produtos") {

        dados = produtos
            .filter((produto) => {

                if (!categoria) return true;

                return produto.categoria === categoria;
            })
            .map((produto) => ({

                SKU: produto.sku,

                Produto: produto.nome,

                Categoria: produto.categoria,

                Descrição:
                    produto.descricao || "-"
            }));
    }


    // ========================================
    // META DO RELATÓRIO
    // ========================================

    let periodo = "Todos os períodos";

    if (dataInicio && dataFim) {

        periodo =
            `${new Date(dataInicio + "T00:00:00")
                .toLocaleDateString("pt-BR")}
            a
            ${new Date(dataFim + "T00:00:00")
                .toLocaleDateString("pt-BR")}`;
    }
if (tipo === "estoque") {
    meta.textContent =
        `Gerado por admin.stockmaster | ` +
        `Categoria: ${categoria || "Todas"} | ` +
        `Busca: ${busca || "Todos os produtos"} | ` +
        `Somente zerados: ${apenasZerados ? "Sim" : "Não"}`;
} else {
    meta.textContent =
        `Gerado por admin.stockmaster | ` +
        `Categoria: ${categoria || "Todas"} | ` +
        `Período: ${periodo}`;
}


    // ========================================
    // MONTAR TABELA
    // ========================================

    if (!dados.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px;">
                    Nenhum dado encontrado para os filtros selecionados.
                </td>
            </tr>
        `;

    } else {

        const colunas = Object.keys(dados[0]);

        thead.innerHTML = `
            <tr>
                ${colunas
                    .map((coluna) => `<th>${coluna}</th>`)
                    .join("")}
            </tr>
        `;

        tbody.innerHTML =
            dados.map((linha) => `
                <tr>
                    ${colunas
                        .map((coluna) =>
                            `<td>${linha[coluna]}</td>`
                        )
                        .join("")}
                </tr>
            `).join("");
    }

    // ========================================
// EXPORTAR PDF
// ========================================

btnPdf.addEventListener("click", async () => {
    if (btnPdf.disabled) return;

    btnPdf.disabled = true;
    btnPdf.setAttribute("aria-busy", "true");

    mensagemArea.className = "mensagem-processamento";
    mensagemArea.textContent = "Preparando arquivo PDF...";

    try {
        const filtros = {};

        if (tipo === "movimentacoes") {
            if (dataInicio) filtros.dataInicio = dataInicio;
            if (dataFim) filtros.dataFim = dataFim;
        }

        if (tipo === "estoque") {
            if (busca) filtros.busca = busca;
            if (categoria) filtros.categoria = categoria;
            filtros.apenasZerados = String(apenasZerados);
        }

        const query = new URLSearchParams(filtros);
        const resposta = await fetch(
            `/api/relatorio/${tipo}/pdf?${query}`,
            { credentials: "same-origin" }
        );

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => null);
            throw new Error(
                erro?.mensagem || "Não foi possível exportar o relatório PDF."
            );
        }

        const tipoArquivo = resposta.headers.get("content-type")?.split(";")[0];
        const disposicao = resposta.headers.get("content-disposition");

        if (
            tipoArquivo !== "application/pdf" ||
            !/^attachment(?:;|$)/i.test(disposicao || "")
        ) {
            throw new Error("O servidor não retornou um arquivo PDF válido.");
        }

        const arquivo = await resposta.blob();

        if (!arquivo.size) {
            throw new Error("O arquivo PDF está vazio.");
        }

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = url;
        link.download = `relatorio-${tipo}.pdf`;
        document.body.append(link);

        try {
            link.click();
        } finally {
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        mensagemArea.className = "mensagem-sucesso";
        mensagemArea.textContent = "Download do arquivo PDF iniciado.";
    } catch (erro) {
        mensagemArea.className = "mensagem-erro";
        mensagemArea.textContent =
            erro.message || "Não foi possível exportar o arquivo PDF.";
    } finally {
        btnPdf.removeAttribute("aria-busy");
        btnPdf.disabled = false;
    }
});

    // ========================================
    // EXPORTAR EXCEL
    // ========================================

    
    const statusExcel = document.querySelector("#statusExportarExcel");

    const tiposExcel = ["movimentacoes", "estoque", "produtos"];
    btnExcel.hidden = !tiposExcel.includes(tipo);

    async function baixarExcel(filtros) {
        const query = new URLSearchParams(filtros);
        const resposta = await fetch(`/api/relatorio/${tipo}/excel?${query}`, {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => null);
            return {
                mensagem: erro?.mensagem || erro?.message ||
                    "Não foi possível exportar o relatório Excel."
            };
        }

        const tipoArquivo = resposta.headers.get("content-type")?.split(";")[0];
        const disposicao = resposta.headers.get("content-disposition");

        if (
            tipoArquivo !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            !/^attachment(?:;|$)/i.test(disposicao || "")
        ) {
            return false;
        }

        const arquivo = await resposta.blob();
        if (!arquivo.size) return false;

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = url;
        link.download = `relatorio-${tipo}.xlsx`;
        document.body.append(link);

        try {
            link.click();
            return true;
        } finally {
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }

    btnExcel.addEventListener("relatorio:exportar-excel", ({ detail }) => {
        detail.responderCom(baixarExcel(detail.filtros));
    });

    btnExcel.addEventListener("click", async () => {
        if (btnExcel.disabled || btnExcel.hidden) return;

        btnExcel.disabled = true;
        btnExcel.setAttribute("aria-busy", "true");
        statusExcel.className = "mensagem-processamento";
        statusExcel.textContent = "Preparando arquivo Excel...";

        try {
            let resposta;

            const filtros = {};

            if (tipo === "movimentacoes") {
                if (dataInicio) filtros.dataInicio = dataInicio;
                if (dataFim) filtros.dataFim = dataFim;
            }

            if (tipo === "estoque") {
                if (busca) filtros.busca = busca;
                if (categoria) filtros.categoria = categoria;
                filtros.apenasZerados = String(apenasZerados);
            }

            btnExcel.dispatchEvent(new CustomEvent("relatorio:exportar-excel", {
                bubbles: true,
                detail: {
                    filtros,
                    responderCom(operacao) {
                        resposta ??= Promise.resolve(operacao);
                    }
                }
            }));

            if (!resposta) {
                statusExcel.className = "mensagem-erro";
                statusExcel.textContent = "A exportação Excel ainda não está disponível.";
                return;
            }

            const resultado = await resposta;

            if (resultado !== true) {
                statusExcel.className = "mensagem-erro";
                statusExcel.textContent = resultado?.mensagem ||
                    "Não foi possível exportar o arquivo Excel. Tente novamente.";
                return;
            }

            statusExcel.className = "mensagem-sucesso";
            statusExcel.textContent = "Download do arquivo Excel iniciado.";
        } catch {
            statusExcel.className = "mensagem-erro";
            statusExcel.textContent = "Não foi possível exportar o arquivo Excel. Tente novamente.";
        } finally {
            btnExcel.removeAttribute("aria-busy");
            btnExcel.disabled = false;
        }
    });

});
