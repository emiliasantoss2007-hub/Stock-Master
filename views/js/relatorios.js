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
    // ELEMENTOS DO FORMULÁRIO
    // ========================================

    const formulario = document.querySelector("#formRelatorio");
    const tipoRelatorio = document.querySelector("#tipoRelatorio");
    const filtroCategoria = document.querySelector("#filtroCategoria");
    const dataInicio = document.querySelector("#dataInicio");
    const dataFim = document.querySelector("#dataFim");

    function dataParaIso(valor) {
        const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
        if (!partes) return "";
        const [, dia, mes, ano] = partes;
        const iso = `${ano}-${mes}-${dia}`;
        const data = new Date(iso);
        return Number(ano) >= 1000 && Number.isFinite(data.getTime()) &&
            data.toISOString().slice(0, 10) === iso ? iso : "";
    }

    const calendario = document.querySelector("#calendarioPeriodo");
    const mesCalendario = document.querySelector("#mesCalendario");
    const diasCalendario = document.querySelector("#diasCalendario");
    const mesAnterior = document.querySelector("#mesAnterior");
    const proximoMes = document.querySelector("#proximoMes");
    const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
    const nomeDia = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "UTC" });
    let campoCalendario;
    let mesVisivel;

    function renderizarCalendario() {
        const ano = mesVisivel.getUTCFullYear();
        const mes = mesVisivel.getUTCMonth();
        const selecionada = dataParaIso(campoCalendario.value);
        const dias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
        const grade = document.createDocumentFragment();
        mesCalendario.textContent = nomeMes.format(mesVisivel);
        mesAnterior.disabled = ano === 1000 && mes === 0;
        proximoMes.disabled = ano === 9999 && mes === 11;
        for (let i = 0; i < mesVisivel.getUTCDay(); i++) grade.append(document.createElement("span"));
        for (let dia = 1; dia <= dias; dia++) {
            const data = new Date(Date.UTC(ano, mes, dia));
            const iso = data.toISOString().slice(0, 10);
            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = dia;
            botao.setAttribute("aria-label", nomeDia.format(data));
            botao.setAttribute("aria-pressed", String(iso === selecionada));
            botao.dataset.data = iso;
            grade.append(botao);
        }
        diasCalendario.replaceChildren(grade);
    }

    diasCalendario.addEventListener("click", (evento) => {
        const data = evento.target.dataset.data;
        if (!data) return;
        campoCalendario.value = data.split("-").reverse().join("/");
        calendario.close();
    });

    for (const [botao, deslocamento] of [[mesAnterior, -1], [proximoMes, 1]]) {
        botao.addEventListener("click", () => {
            mesVisivel.setUTCMonth(mesVisivel.getUTCMonth() + deslocamento);
            renderizarCalendario();
        });
    }

    for (const campo of [dataInicio, dataFim]) {
        const botao = campo.closest(".campo-data-br").querySelector("button");
        campo.addEventListener("input", () => {
            const digitos = campo.value.replace(/\D/g, "").slice(0, 8);
            campo.value = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)]
                .filter(Boolean).join("/");
        });
        botao.addEventListener("click", () => {
            campoCalendario = campo;
            const selecionada = dataParaIso(campo.value);
            const hoje = new Date();
            mesVisivel = selecionada
                ? new Date(`${selecionada.slice(0, 7)}-01T00:00:00Z`)
                : new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), 1));
            renderizarCalendario();
            calendario.showModal();
            (diasCalendario.querySelector('[aria-pressed="true"]') || diasCalendario.querySelector("button")).focus();
        });
    }
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
        visualizarRelatorioArea.style.display = "none";

        const tipo = tipoRelatorio.value;
        const categoria = filtroCategoria.value;
        const inicio = dataParaIso(dataInicio.value);
        const fim = dataParaIso(dataFim.value);

        if ((dataInicio.value && !inicio) || (dataFim.value && !fim)) {
            mensagemArea.innerHTML = '<p class="mensagem-erro">Informe datas válidas no formato DD/MM/AAAA.</p>';
            (dataInicio.value && !inicio ? dataInicio : dataFim).focus();
            return;
        }

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
            if (categoria) {
                mensagemArea.innerHTML = '<p class="mensagem-erro">Selecione Todas para consultar movimentações.</p>';
                return;
            }
            const filtros = new URLSearchParams({ tipo, inicio, fim, origem: "adm" });
            btnVisualizarRelatorio.href = "visualizar_relatorios.html?" + filtros;
            visualizarRelatorioArea.style.display = "block";
            return;
        }

        // ========================================
        // RELATÓRIO DE ESTOQUE ATUAL
        // ========================================

        if (tipo === "estoque") {

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
        // TÍTULO DO RELATÓRIO
        // ========================================

        const nomesRelatorios = {

            movimentacoes:
                "Relatório de Movimentações de Estoque",

            estoque:
                "Relatório de Estoque Atual"
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
