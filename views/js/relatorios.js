
document.addEventListener("DOMContentLoaded", () => {
    let usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    } catch (erro) {
        usuario = null;
    }

    const formulario = document.querySelector("#formRelatorio");
    const busca = document.querySelector("#busca");
    const categoria = document.querySelector("#categoria");
    const apenasZerados = document.querySelector("#apenasZerados");
    const mensagemArea = document.querySelector("#mensagemArea");
    const btnGerar = formulario.querySelector('button[type="submit"]');
    const resultadoArea = document.querySelector("#resultadoArea");
    const corpoRelatorio = document.querySelector("#relatorioCorpo");
    const btnExportarPdf = document.querySelector("#btnExportarPdf");
    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");

    if (!usuario || Number(usuario.id_nivel_acesso) !== 1) {
        window.location.href = "login.html";
        return;
    }

    username.textContent = usuario.nome || usuario.login || "Administrador";
    userAvatar.textContent = (usuario.nome || "AD").substring(0, 2).toUpperCase();

    function mostrarMensagem(texto, tipo) {
        mensagemArea.innerHTML = "";

        const mensagem = document.createElement("p");

        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : tipo === "info" ? "mensagem-info" : "mensagem-erro";

        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatarData(data) {
        return data ? new Date(data).toLocaleString("pt-BR") : "-";
    }

    function obterFiltros() {
        return new URLSearchParams({
            busca: busca.value.trim(),
            categoria: categoria.value.trim(),
            apenasZerados: String(apenasZerados.checked)
        });
    }

    function exibirRelatorio(relatorio, tempoMs) {
        const resumo = relatorio.resumo;
        const itens = relatorio.itens;

        document.querySelector("#relatorioTitulo").textContent = "Relatório de Estoque";
        document.querySelector("#dataGeracao").textContent = formatarData(relatorio.geradoEm);
        document.querySelector("#quantidadeResultados").textContent = `${itens.length} produto(s) encontrado(s)`;
        document.querySelector("#quantidadeTabela").textContent = `${itens.length} registro(s)`;
        document.querySelector("#tempoConsulta").textContent = `Tempo de consulta: ${tempoMs ?? 0} ms`;
        document.querySelector("#totalProdutos").textContent = resumo.totalItens;
        document.querySelector("#totalUnidades").textContent = resumo.totalUnidades;
        document.querySelector("#produtosZerados").textContent = resumo.produtosZerados;
        document.querySelector("#valorTotal").textContent = formatarMoeda(resumo.valorTotalEstoque);

        corpoRelatorio.innerHTML = "";

        if (itens.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 6;
            celula.textContent = "Nenhum produto encontrado para os filtros informados.";

            linha.appendChild(celula);
            corpoRelatorio.appendChild(linha);
        } else {
            itens.forEach((item) => {
                const linha = document.createElement("tr");

                const valores = [
                    item.sku,
                    item.nome,
                    item.categoria,
                    item.quantidadeEstoque,
                    item.valorUnitario == null ? "-" : formatarMoeda(item.valorUnitario),
                    formatarMoeda(item.valorEstoque)
                ];

                valores.forEach((valor) => {
                    const celula = document.createElement("td");
                    celula.textContent = valor == null ? "-" : valor;
                    linha.appendChild(celula);
                });

                corpoRelatorio.appendChild(linha);
            });
        }

        resultadoArea.hidden = false;
        btnExportarPdf.disabled = false;
    }

    // GERAR RELATÓRIO
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        mensagemArea.innerHTML = "";
        btnGerar.disabled = true;
        btnGerar.textContent = "Gerando relatório...";
        btnExportarPdf.disabled = true;

        try {
            const resposta = await fetch(`/api/relatorios/estoque?${obterFiltros().toString()}`, {
                method: "GET",
                credentials: "same-origin"
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Não foi possível gerar o relatório.");
            }

            if (!resultado.dados?.resumo || !Array.isArray(resultado.dados.itens)) {
                throw new Error("O servidor retornou dados inválidos.");
            }

            exibirRelatorio(resultado.dados, resultado.desempenho?.tempoMs);

            mostrarMensagem(resultado.mensagem || "Relatório gerado com sucesso.", "sucesso");

        } catch (erro) {
            mostrarMensagem(erro.message || "Erro ao consultar o relatório.", "erro");
        } finally {
            btnGerar.disabled = false;
            btnGerar.textContent = "Gerar relatório";
        }
    });

    // EXPORTAR PDF
    btnExportarPdf.addEventListener("click", async () => {
        btnExportarPdf.disabled = true;
        btnExportarPdf.textContent = "Exportando PDF...";

        mostrarMensagem("Solicitação de exportação enviada ao servidor.", "info");

        try {
            const resposta = await fetch(`/api/relatorios/estoque/pdf?${obterFiltros().toString()}`, {
                method: "GET",
                credentials: "same-origin"
            });

            const tipoConteudo = resposta.headers.get("content-type") || "";

            if (!resposta.ok || !tipoConteudo.includes("application/pdf")) {
                const erro = await resposta.json().catch(() => ({}));
                throw new Error(erro.mensagem || "O servidor não conseguiu gerar o arquivo PDF.");
            }

            const arquivo = await resposta.blob();

            if (!arquivo.size) {
                throw new Error("O servidor retornou um arquivo PDF vazio.");
            }

            const disposicao = resposta.headers.get("content-disposition") || "";
            const nomeEncontrado = disposicao.match(/filename="?([^";]+)"?/i);

            const nomeArquivo = nomeEncontrado
                ? nomeEncontrado[1]
                : "relatorio_estoque.pdf";

            const urlArquivo = URL.createObjectURL(arquivo);
            const link = document.createElement("a");

            link.href = urlArquivo;
            link.download = nomeArquivo;

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(urlArquivo), 1000);

            mostrarMensagem("Arquivo PDF recebido e exportado com sucesso.", "sucesso");

        } catch (erro) {
            mostrarMensagem(erro.message || "Não foi possível exportar o PDF.", "erro");
        } finally {
            btnExportarPdf.disabled = false;
            btnExportarPdf.innerHTML = '<span aria-hidden="true">⇩</span> Exportar PDF';
        }
    });

    // LIMPAR FILTROS
    formulario.addEventListener("reset", () => {
        mensagemArea.innerHTML = "";
        resultadoArea.hidden = true;
        corpoRelatorio.innerHTML = "";
        btnExportarPdf.disabled = true;
    });
});
