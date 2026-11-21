document.addEventListener("DOMContentLoaded", async () => {

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

    if (tipo === "produtos") {
        window.location.replace("relatorio_produtos.html");
        return;
    }

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
    // TÍTULOS
    // ========================================

    const nomesRelatorios = {
        movimentacoes: "Relatório de Movimentações de Estoque",
        estoque: "Relatório de Estoque Atual"
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

    const colunasMovimentacoes = ["Código", "Produto", "SKU", "Tipo de movimentação",
        "Quantidade", "Data", "Responsável", "Justificativa"];
    let historicoCarregado = false;
    if (tipo === "movimentacoes") {
        mensagemArea.setAttribute("role", "status");
        if (categoria) {
            mensagemArea.textContent = "Selecione Todas na Central de Relatórios para consultar movimentações.";
            mensagemArea.className = "mensagem-erro";
        } else {
            mensagemArea.textContent = "Consultando movimentações...";
            try {
                const filtros = new URLSearchParams({ data_inicio: dataInicio, data_fim: dataFim });
                const resposta = await fetch("/api/relatorio/movimentacoes?" + filtros, { credentials: "same-origin" });
                if (!resposta.ok) {
                    const erro = await resposta.json().catch(() => null);
                    throw new Error(erro?.mensagem || erro?.message);
                }
                const registros = await resposta.json();
                dados = registros.map(registro => {
                    const valor = registro.data_movimentacao;
                    const data = typeof valor === "string" ? valor.replace(" ", "T") : valor;
                    const utc = typeof data === "string" && data.length > 10 && !/(?:Z|[+-]\d{2}:\d{2})$/.test(data)
                        ? data + "Z" : data;
                    const instante = utc ? new Date(utc) : null;
                    return {
                        Código: registro.id_movimentacao,
                        Produto: registro.nome_produto,
                        SKU: registro.sku_produto,
                        "Tipo de movimentação": registro.tipo_movimentacao,
                        Quantidade: registro.quantidade,
                        Data: instante && Number.isFinite(instante.getTime())
                            ? instante.toLocaleString("pt-BR", { timeZone: "UTC" }).replace(", ", " ")
                            : valor,
                        Responsável: registro.nome_responsavel,
                        Justificativa: registro.justificativa
                    };
                });
                historicoCarregado = true;
                mensagemArea.textContent = "";
            } catch (erro) {
                mensagemArea.textContent = erro.message || "Não foi possível consultar as movimentações. Recarregue a página para tentar novamente.";
                mensagemArea.className = "mensagem-erro";
            }
        }
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
        (tipo === "movimentacoes" ? "Datas em UTC | " : "Gerado por admin.stockmaster | ") +
        `Categoria: ${categoria || "Todas"} | ` +
        `Período: ${periodo}`;


    // ========================================
    // MONTAR TABELA
    // ========================================

    const colunas = tipo === "movimentacoes" ? colunasMovimentacoes : Object.keys(dados[0] || {});
    if (colunas.length) {
        const cabecalho = thead.insertRow();
        for (const coluna of colunas) {
            const celula = document.createElement("th");
            celula.scope = "col";
            celula.textContent = coluna;
            cabecalho.append(celula);
        }
    }
    if (!dados.length && (tipo !== "movimentacoes" || historicoCarregado)) {
        const celula = tbody.insertRow().insertCell();
        celula.colSpan = colunas.length || 6;
        celula.style.cssText = "text-align:center; padding:30px;";
        celula.textContent = "Nenhum dado encontrado para os filtros selecionados.";
    }
    for (const registro of dados) {
        const linha = tbody.insertRow();
        for (const coluna of colunas) linha.insertCell().textContent = registro[coluna] ?? "—";
    }

    // ========================================
    // EXPORTAR PDF
    // ========================================

    const statusPdf = document.querySelector("#statusExportarPdf");
    btnPdf.hidden = tipo !== "movimentacoes";
    btnPdf.disabled = !historicoCarregado;

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
    btnExcel.disabled = !historicoCarregado;
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
