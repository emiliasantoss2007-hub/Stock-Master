document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // CONTROLE DE ACESSO E NAVEGAÇÃO
    // ========================================

    const params = new URLSearchParams(window.location.search);
    const origem = params.get("origem");

    const dashboardLink = document.querySelector("#dashboardLink");
    const breadcrumbLink = document.querySelector("#breadcrumbLink");
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

    // ========================================
    // RELATÓRIOS SÃO EXCLUSIVOS DO ADMIN
    // ========================================

    if (origem === "tecnico") {
        window.location.href = "dashboard_tec.html";
        return;
    }

    // ========================================
    // CONFIGURAÇÃO DO ADMINISTRADOR
    // ========================================

    dashboardLink.href = "dashboard_adm.html";
    breadcrumbLink.href = "dashboard_adm.html";

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
    // ELEMENTOS DO FORMULÁRIO
    // ========================================

    const formulario = document.querySelector("#formRelatorio");
    const tipoRelatorio = document.querySelector("#tipoRelatorio");
    const filtroCategoria = document.querySelector("#filtroCategoria");
    const dataInicio = document.querySelector("#dataInicio");
    const dataFim = document.querySelector("#dataFim");
    const mensagemArea = document.querySelector("#mensagemArea");
    
    const visualizarRelatorioArea = document.querySelector("#visualizarRelatorioArea");
    const btnVisualizarRelatorio = document.querySelector("#btnVisualizarRelatorio");

    // ========================================
    // PREENCHER CATEGORIAS
    // ========================================

    const categorias = [
        ...new Set(produtos.map((produto) => produto.categoria))
    ];

    categorias.forEach((categoria) => {

        const opt = document.createElement("option");

        opt.value = categoria;
        opt.textContent = categoria;

        filtroCategoria.appendChild(opt);
    });

    // ========================================
    // GERAR RELATÓRIO
    // ========================================

    formulario.addEventListener("submit", (e) => {

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

        if ((inicio && !fim) || (!inicio && fim)) {

            mensagemArea.innerHTML = `
                <p class="mensagem-erro">
                    Preencha a data inicial e a data final,
                    ou deixe as duas em branco.
                </p>
            `;

            return;
        }

        // ========================================
        // DADOS DO RELATÓRIO
        // ========================================

        let dados = [];

        // ========================================
        // RELATÓRIO DE MOVIMENTAÇÕES
        // ========================================

        if (tipo === "movimentacoes") {

            dados = movimentacoes

                // Filtro de data inicial
                .filter((movimentacao) => {

                    if (!inicio) {
                        return true;
                    }

                    return new Date(movimentacao.data) >=
                        new Date(inicio + "T00:00:00");
                })

                // Filtro de data final
                .filter((movimentacao) => {

                    if (!fim) {
                        return true;
                    }

                    return new Date(movimentacao.data) <=
                        new Date(fim + "T23:59:59");
                })

                // Filtro de categoria
                .filter((movimentacao) => {

                    if (!categoria) {
                        return true;
                    }

                    const produto = produtos.find(
                        (p) => p.id === movimentacao.produtoId
                    );

                    return produto &&
                        produto.categoria === categoria;
                })

                // Formatação dos dados
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

                        Quantidade:
                            movimentacao.quantidade,

                        Responsável:
                            movimentacao.usuario,

                        Justificativa:
                            movimentacao.justificativa || "-"
                    };
                });
        }

        // ========================================
        // RELATÓRIO DE ESTOQUE ATUAL
        // ========================================

        else if (tipo === "estoque") {

            dados = produtos

                .filter((produto) => {

                    if (!categoria) {
                        return true;
                    }

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
        // RELATÓRIO DE PRODUTOS CADASTRADOS
        // ========================================

        else if (tipo === "produtos") {

            dados = produtos

                .filter((produto) => {

                    if (!categoria) {
                        return true;
                    }

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

        btnVisualizarRelatorio.href =
            `visualizar_relatorios.html?tipo=${encodeURIComponent(tipo)}&categoria=${encodeURIComponent(categoria)}&inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}&origem=adm`;

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