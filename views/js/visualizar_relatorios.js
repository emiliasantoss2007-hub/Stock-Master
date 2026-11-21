document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // PARÂMETROS DA URL
    // ========================================

    const params = new URLSearchParams(window.location.search);

    const origem = params.get("origem");
    const tipo = params.get("tipo");
    const categoria = params.get("categoria") || "";
    const dataInicio = params.get("inicio") || "";
    const dataFim = params.get("fim") || "";


    // ========================================
    // ACESSO DO ADMINISTRADOR
    // ========================================

    if (origem === "tecnico") {
        window.location.href = "dashboard_tec.html";
        return;
    }


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


    // ========================================
    // MOVIMENTAÇÕES FICTÍCIAS
    // ========================================

    const movimentacoes = [
        {
            data: "2026-09-08T14:30:00",
            produtoId: 1,
            tipo: "Entrada",
            quantidade: 10,
            usuario: "admin.stockmaster",
            justificativa: "Reposição de estoque"
        },
        {
            data: "2026-09-08T11:15:00",
            produtoId: 3,
            tipo: "Saída",
            quantidade: 2,
            usuario: "tecnico.stockmaster",
            justificativa: "Utilização em manutenção"
        },
        {
            data: "2026-09-07T16:40:00",
            produtoId: 2,
            tipo: "Expurgo",
            quantidade: 3,
            usuario: "admin.stockmaster",
            justificativa: "Produto danificado"
        },
        {
            data: "2026-09-06T10:20:00",
            produtoId: 1,
            tipo: "Saída",
            quantidade: 4,
            usuario: "tecnico.stockmaster",
            justificativa: "Utilização em manutenção"
        },
        {
            data: "2026-09-05T09:10:00",
            produtoId: 2,
            tipo: "Entrada",
            quantidade: 15,
            usuario: "admin.stockmaster",
            justificativa: "Reposição de estoque"
        }
    ];


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

        dados = movimentacoes
            .filter((movimentacao) => {

                if (!dataInicio) return true;

                return new Date(movimentacao.data) >=
                    new Date(dataInicio + "T00:00:00");
            })
            .filter((movimentacao) => {

                if (!dataFim) return true;

                return new Date(movimentacao.data) <=
                    new Date(dataFim + "T23:59:59");
            })
            .filter((movimentacao) => {

                if (!categoria) return true;

                const produto = produtos.find(
                    (p) => p.id === movimentacao.produtoId
                );

                return produto &&
                    produto.categoria === categoria;
            })
            .map((movimentacao) => {

                const produto = produtos.find(
                    (p) => p.id === movimentacao.produtoId
                );

                const data = new Date(movimentacao.data);

                return {
                    Data:
                        data.toLocaleDateString("pt-BR") +
                        " " +
                        data.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit"
                        }),

                    Produto: produto
                        ? produto.nome
                        : "Produto removido",

                    Tipo: movimentacao.tipo,

                    Quantidade: movimentacao.quantidade,

                    Responsável: movimentacao.usuario,

                    Justificativa:
                        movimentacao.justificativa || "-"
                };
            });
    }


    // ========================================
    // ESTOQUE ATUAL
    // ========================================

    else if (tipo === "estoque") {

        dados = produtos
            .filter((produto) => {

                if (!categoria) return true;

                return produto.categoria === categoria;
            })
            .map((produto) => ({

                SKU: produto.sku,

                Produto: produto.nome,

                Categoria: produto.categoria,

                "Quantidade em estoque":
                    produto.quantidade,

                "Valor unitário":
                    `R$ ${produto.valor
                        .toFixed(2)
                        .replace(".", ",")}`
            }));
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

    meta.textContent =
        `Gerado por admin.stockmaster | ` +
        `Categoria: ${categoria || "Todas"} | ` +
        `Período: ${periodo}`;


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

    const statusPdf = document.querySelector("#statusExportarPdf");
    btnPdf.hidden = tipo !== "movimentacoes";

    if (!btnPdf.hidden && categoria) {
        btnPdf.disabled = true;
        statusPdf.className = "mensagem-erro";
        statusPdf.textContent = "A exportação PDF não aceita filtro por categoria. Faça uma nova consulta com a opção Todas.";
    }

    async function baixarPdf(filtros) {
        const query = new URLSearchParams(filtros);
        const resposta = await fetch(`/api/relatorio/movimentacoes/pdf?${query}`, {
            credentials: "same-origin"
        });
        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => null);
            return { mensagem: erro?.mensagem || erro?.message };
        }
        const tipoArquivo = resposta.headers.get("content-type")?.split(";")[0];
        const disposicao = resposta.headers.get("content-disposition");
        if (tipoArquivo !== "application/pdf" || !/^attachment(?:;|$)/i.test(disposicao || "")) {
            return false;
        }

        const arquivo = await resposta.blob();
        if (await arquivo.slice(0, 5).text() !== "%PDF-") return false;

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-movimentacoes.pdf";
        try {
            document.body.append(link);
            link.click();
            return true;
        } finally {
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }

    btnPdf.addEventListener("relatorio:exportar-pdf", ({ detail }) => {
        detail.responderCom(baixarPdf(detail.filtros));
    });

    let exportandoPdf = false;
    btnPdf.addEventListener("click", async () => {
        if (exportandoPdf || btnPdf.disabled || btnPdf.hidden) return;

        exportandoPdf = true;
        btnPdf.setAttribute("aria-disabled", "true");
        btnPdf.setAttribute("aria-busy", "true");
        statusPdf.className = "mensagem-processamento-pdf";
        statusPdf.textContent = "Preparando arquivo PDF...";

        try {
            let resposta;
            btnPdf.dispatchEvent(new CustomEvent("relatorio:exportar-pdf", {
                bubbles: true,
                detail: {
                    filtros: { data_inicio: dataInicio, data_fim: dataFim },
                    // Registre a Promise durante o evento. Resolva com true só
                    // após iniciar o download do PDF retornado pelo Controller.
                    responderCom(operacao) {
                        resposta ??= Promise.resolve(operacao);
                    }
                }
            }));

            if (!resposta) {
                statusPdf.className = "mensagem-erro";
                statusPdf.textContent = "A exportação PDF ainda não está disponível.";
                return;
            }

            const resultado = await resposta;
            if (resultado !== true) {
                statusPdf.className = "mensagem-erro";
                statusPdf.textContent = resultado?.mensagem ||
                    "Não foi possível exportar o arquivo PDF. Tente novamente.";
                return;
            }
            statusPdf.className = "mensagem-sucesso";
            statusPdf.textContent = "Download do arquivo PDF iniciado.";
        } catch {
            statusPdf.className = "mensagem-erro";
            statusPdf.textContent = "Não foi possível exportar o arquivo PDF. Tente novamente.";
        } finally {
            exportandoPdf = false;
            btnPdf.removeAttribute("aria-disabled");
            btnPdf.removeAttribute("aria-busy");
        }
    });


    // ========================================
    // EXPORTAR EXCEL
    // ========================================

    const statusExcel = document.querySelector("#statusExportarExcel");

    btnExcel.hidden = tipo !== "movimentacoes";
    if (!btnExcel.hidden && categoria) {
        btnExcel.disabled = true;
        statusExcel.className = "mensagem-erro";
        statusExcel.textContent = "A exporta??o Excel n?o aceita filtro por categoria. Fa?a uma nova consulta com a op??o Todas.";
    }

    async function baixarExcel(filtros) {
        const query = new URLSearchParams(filtros);
        const resposta = await fetch(`/api/relatorio/movimentacoes/excel?${query}`, {
            credentials: "same-origin"
        });
        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => null);
            return { mensagem: erro?.mensagem || erro?.message ||
                (resposta.status === 404 ? "A exporta??o Excel ainda n?o est? dispon?vel." : "") };
        }

        const tipoArquivo = resposta.headers.get("content-type")?.split(";")[0];
        const disposicao = resposta.headers.get("content-disposition");
        if (tipoArquivo !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            !/^attachment(?:;|$)/i.test(disposicao || "")) {
            return false;
        }

        const arquivo = await resposta.blob();
        if (!arquivo.size) return false;

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-movimentacoes.xlsx";
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
            btnExcel.dispatchEvent(new CustomEvent("relatorio:exportar-excel", {
                bubbles: true,
                detail: {
                    filtros: { dataInicio, dataFim },
                    // O integrador registra uma Promise durante o evento e a resolve
                    // com true apenas ap?s iniciar o download do XLSX recebido do Controller.
                    responderCom(operacao) {
                        resposta ??= Promise.resolve(operacao);
                    }
                }
            }));

            if (!resposta) {
                statusExcel.className = "mensagem-erro";
                statusExcel.textContent = "A exporta??o Excel ainda n?o est? dispon?vel.";
                return;
            }

            const resultado = await resposta;
            if (resultado !== true) {
                statusExcel.className = "mensagem-erro";
                statusExcel.textContent = resultado?.mensagem ||
                    "N?o foi poss?vel exportar o arquivo Excel. Tente novamente.";
                return;
            }
            statusExcel.className = "mensagem-sucesso";
            statusExcel.textContent = "Download do arquivo Excel iniciado.";
        } catch {
            statusExcel.className = "mensagem-erro";
            statusExcel.textContent = "N?o foi poss?vel exportar o arquivo Excel. Tente novamente.";
        } finally {
            btnExcel.removeAttribute("aria-busy");
            btnExcel.disabled = false;
        }
    });

});
