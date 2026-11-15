document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const origem = params.get("origem");
    const dashboardLink = document.querySelector("#dashboardLink");
    const breadcrumbLink = document.querySelector("#breadcrumbLink");
    const backLink = document.querySelector("#historyBackLink");
    const produtosLink = document.querySelector("#produtosLink");
    const usuariosLink = document.querySelector("#usuariosLink");
    const entradaLink = document.querySelector("#entradaLink");
    const saidaLink = document.querySelector("#saidaLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const historicoLink = document.querySelector("#historicoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");
    const perfilLink = document.querySelector("#perfilLink");
    const produtosMenuText = document.querySelector("#produtosMenuText");
    const userRole = document.querySelector("#userRole");
    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");

    if (origem === "tecnico") {
        dashboardLink.href = "dashboard_tec.html";
        breadcrumbLink.href = "dashboard_tec.html";
        backLink.href = "dashboard_tec.html";
        produtosLink.href = "produtos.html?origem=tecnico";
        produtosMenuText.textContent = "Consultar produtos";
        entradaLink.href = "entrada_estoque.html?origem=tecnico";
        saidaLink.href = "saída_estoque.html?origem=tecnico";
        historicoLink.href = "historico_movimentacao.html?origem=tecnico";
        perfilLink.href = "perfil.html?origem=tecnico";
        userRole.textContent = "Técnico";
        username.textContent = "tecnico.stockmaster";
        userAvatar.textContent = "TC";
        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";
    } else {
        dashboardLink.href = "dashboard_adm.html";
        breadcrumbLink.href = "dashboard_adm.html";
        backLink.href = "dashboard_adm.html";
        produtosLink.href = "produtos.html?origem=adm";
        produtosMenuText.textContent = "Produtos";
        entradaLink.href = "entrada_estoque.html?origem=adm";
        saidaLink.href = "saída_estoque.html?origem=adm";
        expurgoLink.href = "expurgo_estoque.html?origem=adm";
        historicoLink.href = "historico_movimentacao.html?origem=adm";
        relatoriosLink.href = "relatorios.html?origem=adm";
        perfilLink.href = "perfil.html?origem=adm";
        userRole.textContent = "Administrador";
        username.textContent = "admin.stockmaster";
        userAvatar.textContent = "AD";
        usuariosLink.style.display = "";
        expurgoLink.style.display = "";
        relatoriosLink.style.display = "";
    }

    const filtrosForm = document.querySelector("#filtrosHistorico");
    const tabela = document.querySelector("#tabelaHistorico");
    const feedback = document.querySelector("#historyFeedback");
    const produtoSelect = filtrosForm.elements.id_produto;
    const botaoFiltrar = document.querySelector("#btnFiltrar");
    let requisicaoAtual = 0;

    function coletarFiltros() {
        return {
            id_produto: filtrosForm.elements.id_produto.value,
            data_inicio: filtrosForm.elements.data_inicio.value,
            data_fim: filtrosForm.elements.data_fim.value,
            tipo_movimentacao: filtrosForm.elements.tipo_movimentacao.value
        };
    }

    function limparTabela() {
        tabela.replaceChildren();
    }

    function atualizarProdutos(registros) {
        const produtoSelecionado = produtoSelect.value;
        const produtos = new Map(
            Array.from(produtoSelect.options)
                .filter((opcao) => opcao.value)
                .map((opcao) => [opcao.value, opcao.textContent])
        );

        registros.forEach((registro) => {
            if (registro.id_produto == null || !registro.nome_produto) return;
            produtos.set(String(registro.id_produto), String(registro.nome_produto));
        });

        produtoSelect.replaceChildren(produtoSelect.options[0]);
        Array.from(produtos.entries())
            .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
            .forEach(([idProduto, nomeProduto]) => {
                const opcao = document.createElement("option");
                opcao.value = idProduto;
                opcao.textContent = nomeProduto;
                produtoSelect.appendChild(opcao);
            });
        produtoSelect.value = produtoSelecionado;
    }

    function formatarData(data) {
        const dataMovimentacao = new Date(data);
        if (Number.isNaN(dataMovimentacao.getTime())) return "-";

        return `${dataMovimentacao.toLocaleDateString("pt-BR")} ${dataMovimentacao.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        })}`;
    }

    function renderizarResultados(registros) {
        limparTabela();

        if (!registros.length) {
            const linhaVazia = document.createElement("tr");
            linhaVazia.className = "history-empty-row";
            const celulaVazia = document.createElement("td");
            celulaVazia.colSpan = 6;
            celulaVazia.textContent = "Nenhuma movimentação disponível para exibição.";
            linhaVazia.appendChild(celulaVazia);
            tabela.appendChild(linhaVazia);
            return;
        }

        registros
            .slice()
            .sort((a, b) => {
                const diferencaData = new Date(b.data_movimentacao) - new Date(a.data_movimentacao);
                if (diferencaData !== 0) return diferencaData;
                return (b.id_movimentacao || 0) - (a.id_movimentacao || 0);
            })
            .forEach((registro) => {
                const linha = document.createElement("tr");
                const tipoNormalizado = String(registro.tipo_movimentacao || "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .trim()
                    .toUpperCase();
                const classesTipo = {
                    ENTRADA: "badge-entrada",
                    SAIDA: "badge-saida",
                    EXPURGO: "badge-outro"
                };
                const campos = [
                    ["Data", formatarData(registro.data_movimentacao)],
                    ["Produto", registro.nome_produto],
                    ["Tipo", registro.tipo_movimentacao],
                    ["Quantidade", registro.quantidade],
                    ["Responsável", registro.nome_responsavel || registro.login_responsavel],
                    ["Justificativa", registro.justificativa || "-"]
                ];

                campos.forEach(([rotulo, valor]) => {
                    const celula = document.createElement("td");
                    celula.dataset.label = rotulo;

                    if (rotulo === "Tipo") {
                        const badge = document.createElement("span");
                        badge.className = `badge-tipo ${classesTipo[tipoNormalizado] || "badge-outro"}`;
                        badge.textContent = valor == null ? "-" : String(valor);
                        celula.appendChild(badge);
                    } else {
                        celula.textContent = valor == null ? "-" : String(valor);
                    }

                    linha.appendChild(celula);
                });

                tabela.appendChild(linha);
            });
    }

    function montarUrlHistorico(filtros) {
        const parametros = new URLSearchParams();
        ["id_produto", "data_inicio", "data_fim", "tipo_movimentacao"].forEach((campo) => {
            const valor = filtros[campo];
            if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
                parametros.set(campo, String(valor));
            }
        });

        const query = parametros.toString();
        return query ? `/api/historico?${query}` : "/api/historico";
    }

    async function mensagemErroHTTP(response) {
        const texto = await response.text();
        if (texto) {
            try {
                const corpo = JSON.parse(texto);
                if (corpo && typeof corpo.message === "string" && corpo.message) return corpo.message;
            } catch (erro) {
                if (!(erro instanceof SyntaxError)) throw erro;
            }
        }

        return `Não foi possível consultar o histórico (HTTP ${response.status}).`;
    }

    async function consultarHistorico(filtros) {
        const numeroRequisicao = ++requisicaoAtual;
        feedback.textContent = "Consultando histórico...";
        botaoFiltrar.disabled = true;
        filtrosForm.setAttribute("aria-busy", "true");
        tabela.setAttribute("aria-busy", "true");

        let mensagemErro;
        try {
            const response = await fetch(montarUrlHistorico(filtros), {
                credentials: "same-origin",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                mensagemErro = await mensagemErroHTTP(response);
                throw new Error(mensagemErro);
            }

            let registros;
            try {
                registros = await response.json();
            } catch (erro) {
                mensagemErro = "O servidor retornou uma resposta inválida para o histórico.";
                throw erro;
            }

            if (!Array.isArray(registros)) {
                mensagemErro = "O servidor retornou uma resposta inválida para o histórico.";
                throw new TypeError("A resposta do histórico deve ser uma lista.");
            }

            if (numeroRequisicao !== requisicaoAtual) return;
            atualizarProdutos(registros);
            renderizarResultados(registros);
            feedback.textContent = registros.length
                ? `Consulta concluída: ${registros.length} movimentação(ões).`
                : "Nenhuma movimentação encontrada para os filtros informados.";
        } catch (erro) {
            console.error("Erro ao consultar histórico de movimentações:", erro);
            if (numeroRequisicao === requisicaoAtual) {
                feedback.textContent = mensagemErro
                    || "Não foi possível carregar o histórico. Verifique a conexão e tente novamente.";
            }
        } finally {
            if (numeroRequisicao === requisicaoAtual) {
                botaoFiltrar.disabled = false;
                filtrosForm.setAttribute("aria-busy", "false");
                tabela.setAttribute("aria-busy", "false");
            }
        }
    }

    document.addEventListener("historico:filtrar", (event) => {
        const filtros = event.detail && typeof event.detail === "object"
            ? event.detail
            : coletarFiltros();
        consultarHistorico(filtros);
    });

    filtrosForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const filtros = coletarFiltros();
        document.dispatchEvent(new CustomEvent("historico:filtrar", { detail: filtros }));
    });

    filtrosForm.addEventListener("reset", () => {
        window.setTimeout(() => {
            document.dispatchEvent(new CustomEvent("historico:filtrar", {
                detail: coletarFiltros()
            }));
        }, 0);
    });

    renderizarResultados([]);
    document.dispatchEvent(new CustomEvent("historico:filtrar", {
        detail: coletarFiltros()
    }));
});
