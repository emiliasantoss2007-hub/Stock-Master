document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(
        localStorage.getItem("usuarioLogado") || "null"
    );

    const formulario = document.querySelector("#formRelatorio");
    const busca = document.querySelector("#busca");
    const categoria = document.querySelector("#categoria");
    const apenasZerados = document.querySelector("#apenasZerados");
    const mensagemArea = document.querySelector("#mensagemArea");
    const btnGerar = formulario.querySelector('button[type="submit"]');
    const btnExportarPdf = document.querySelector("#btnExportarPdf");
    const resultadoArea = document.querySelector("#resultadoArea");
    const corpoRelatorio = document.querySelector("#relatorioCorpo");
    const quantidadeTabela = document.querySelector("#quantidadeTabela");

    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");

    let ultimosParametros = new URLSearchParams();

    if (!usuario || Number(usuario.id_nivel_acesso) !== 1) {
        window.location.href = "login.html";
        return;
    }

    username.textContent = usuario.nome || usuario.login || "Administrador";
    userAvatar.textContent = (usuario.nome || "AD")
        .substring(0, 2)
        .toUpperCase();

    function mostrarMensagem(texto, tipo) {
        mensagemArea.innerHTML = "";
        const mensagem = document.createElement("p");

        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : "mensagem-erro";

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
        if (!data) return "-";
        return new Date(data).toLocaleString("pt-BR");
    }

    function obterParametrosFiltro() {
        return new URLSearchParams({
            busca: busca.value.trim(),
            categoria: categoria.value.trim(),
            apenasZerados: String(apenasZerados.checked)
        });
    }

    function exibirRelatorio(relatorio) {
        const resumo = relatorio.resumo;
        const itens = relatorio.itens;

        document.querySelector("#relatorioTitulo").textContent =
            "Relatório de Estoque";

        document.querySelector("#dataGeracao").textContent =
            formatarData(relatorio.geradoEm);

        document.querySelector("#quantidadeResultados").textContent =
            `${itens.length} produto(s) encontrado(s)`;

        if (quantidadeTabela) {
            quantidadeTabela.textContent =
                `${itens.length} registro(s)`;
        }

        document.querySelector("#totalProdutos").textContent =
            resumo.totalItens;

        document.querySelector("#totalUnidades").textContent =
            resumo.totalUnidades;

        document.querySelector("#produtosZerados").textContent =
            resumo.produtosZerados;

        document.querySelector("#valorTotal").textContent =
            formatarMoeda(resumo.valorTotalEstoque);

        corpoRelatorio.innerHTML = "";

        if (itens.length === 0) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");

            celula.colSpan = 6;
            celula.textContent =
                "Nenhum produto encontrado para os filtros informados.";

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
                    item.valorUnitario == null
                        ? "-"
                        : formatarMoeda(item.valorUnitario),
                    formatarMoeda(item.valorEstoque)
                ];

                valores.forEach((valor) => {
                    const celula = document.createElement("td");

                    celula.textContent =
                        valor == null ? "-" : valor;

                    linha.appendChild(celula);
                });

                corpoRelatorio.appendChild(linha);
            });
        }

        resultadoArea.hidden = false;
        resultadoArea.style.display = "block";
        if (btnExportarPdf) {
            btnExportarPdf.disabled = false;
        }
    }

    // SOLICITAR RELATÓRIO
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        mensagemArea.innerHTML = "";
        btnGerar.disabled = true;
        btnGerar.textContent = "Gerando relatório...";
        if (btnExportarPdf) {
            btnExportarPdf.disabled = true;
        }

        const parametros = obterParametrosFiltro();
        ultimosParametros = parametros;

        try {
            const resposta = await fetch(
                `/api/relatorios/estoque?${parametros.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "X-User": JSON.stringify(usuario)
                    }
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(
                    resultado.mensagem ||
                    "Não foi possível gerar o relatório."
                );
            }

            if (
                !resultado.dados ||
                !resultado.dados.resumo ||
                !Array.isArray(resultado.dados.itens)
            ) {
                throw new Error("O servidor retornou dados inválidos.");
            }

            exibirRelatorio(resultado.dados);
            mostrarMensagem(resultado.mensagem, "sucesso");

        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        } finally {
            btnGerar.disabled = false;
            btnGerar.textContent = "Gerar relatório";
        }
    });

    // EXPORTAR PDF
    if (btnExportarPdf) {
        btnExportarPdf.addEventListener("click", async () => {
            const parametros = ultimosParametros.toString()
                ? ultimosParametros
                : obterParametrosFiltro();
            const urlPdf = `/api/relatorios/estoque/pdf?${parametros.toString()}`;

            btnExportarPdf.disabled = true;
            const textoOriginal = btnExportarPdf.textContent;
            btnExportarPdf.textContent = "Exportando PDF...";

            try {
                const resposta = await fetch(urlPdf, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "X-User": JSON.stringify(usuario)
                    }
                });

                if (!resposta.ok) {
                    let mensagemErro = "Não foi possível exportar o PDF.";
                    try {
                        const corpoErro = await resposta.json();
                        if (corpoErro && corpoErro.mensagem) {
                            mensagemErro = corpoErro.mensagem;
                        }
                    } catch {
                        // Resposta não é JSON
                    }
                    throw new Error(mensagemErro);
                }

                const blob = await resposta.blob();
                const disposicao = resposta.headers.get("Content-Disposition") || "";
                const matchNome = disposicao.match(/filename="?([^";]+)"?/i);
                const nomeArquivo = matchNome
                    ? matchNome[1]
                    : `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.pdf`;

                const urlBlob = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = urlBlob;
                link.download = nomeArquivo;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(urlBlob);

                mostrarMensagem("PDF exportado com sucesso.", "sucesso");
            } catch (erro) {
                mostrarMensagem(erro.message, "erro");
            } finally {
                btnExportarPdf.disabled = false;
                btnExportarPdf.innerHTML = textoOriginal || '<span aria-hidden="true">⇩</span> Exportar PDF';
            }
        });
    }

    // LIMPAR FILTROS
    formulario.addEventListener("reset", () => {
        mensagemArea.innerHTML = "";
        resultadoArea.hidden = true;
        resultadoArea.style.display = "none";
        corpoRelatorio.innerHTML = '<tr><td colspan="6">Nenhum relatório gerado.</td></tr>';
        ultimosParametros = new URLSearchParams();
        if (btnExportarPdf) {
            btnExportarPdf.disabled = true;
        }
    });
});