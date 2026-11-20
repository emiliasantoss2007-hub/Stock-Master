
document.addEventListener("DOMContentLoaded", () => {
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

    if (origem === "tecnico") {
        window.location.href = "dashboard_tec.html";
        return;
    }

    dashboardLink.href = "dashboard_adm.html";
    breadcrumbLink.href = "dashboard_adm.html";
    produtosLink.href = "produtos.html?origem=adm";
    entradaLink.href = "entrada_estoque.html?origem=adm";
    saidaLink.href = "saída_estoque.html?origem=adm";
    expurgoLink.href = "expurgo_estoque.html?origem=adm";
    historicoLink.href = "historico_movimentacao.html?origem=adm";
    relatoriosLink.href = "relatorios.html?origem=adm";
    perfilLink.href = "perfil.html?origem=adm";

    document.querySelector("#userRole").textContent = "Administrador";
    document.querySelector("#username").textContent = "admin.stockmaster";
    document.querySelector("#userAvatar").textContent = "AD";
    usuariosLink.style.display = "";
    relatoriosLink.style.display = "";

    const formulario = document.querySelector("#formExpurgo");
    const select = document.querySelector("#produtoSelect");
    const justificativa = document.querySelector("#justificativa");
    const confirmacao = document.querySelector("#confirmacao");
    const btnExpurgar = document.querySelector("#btnExpurgar");
    const mensagemArea = document.querySelector("#mensagemArea");
    const produtoResumo = document.querySelector("#produtoResumo");
    const infoNome = document.querySelector("#produtoNome");
    const infoSku = document.querySelector("#produtoSku");
    const infoSaldo = document.querySelector("#produtoSaldo");
    const contadorCaracteres = document.querySelector("#contadorCaracteres");
    const modalOverlay = document.querySelector("#modalOverlay");
    const modalMensagem = document.querySelector("#modalMensagem");
    const modalCancelar = document.querySelector("#modalCancelar");
    const modalConfirmar = document.querySelector("#modalConfirmar");

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    let produtos = [];
    let produtoPendente = null;

    function obterCabecalhos() {
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-User": JSON.stringify({
                id_usuario: usuario.id_usuario,
                id_nivel_acesso: usuario.id_nivel_acesso
            })
        };
    }

    function mostrarMensagem(texto, tipo = "erro") {
        mensagemArea.replaceChildren();

        const mensagem = document.createElement("p");
        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : tipo === "info"
                ? "mensagem-info"
                : "mensagem-erro";
        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    function obterProdutoSelecionado() {
        return produtos.find(
            (produto) => String(produto.id_produto) === select.value
        );
    }

    function atualizarBotao() {
        btnExpurgar.disabled = !(
            select.value &&
            justificativa.value.trim() &&
            confirmacao.checked
        );
    }

    function atualizarResumo() {
        const produto = obterProdutoSelecionado();

        if (!produto) {
            produtoResumo.hidden = true;
            atualizarBotao();
            return;
        }

        infoNome.textContent = produto.nome;
        infoSku.textContent = `SKU: ${produto.sku || "Não informado"}`;
        infoSaldo.textContent = Number(produto.quantidade_estoque || 0).toLocaleString("pt-BR");
        produtoResumo.hidden = false;
        atualizarBotao();
    }

    async function carregarProdutos() {
        if (!usuario?.id_usuario) {
            select.innerHTML = '<option value="">Faça login novamente</option>';
            mostrarMensagem("Não foi possível identificar o usuário. Faça login novamente.");
            return;
        }

        try {
            select.innerHTML = '<option value="">Carregando produtos...</option>';

            const resposta = await fetch("/api/produtos/entrada/listar", {
                method: "GET",
                headers: obterCabecalhos()
            });

            const resultado = await lerResposta(resposta);
            produtos = Array.isArray(resultado.produtos)
                ? resultado.produtos
                : [];

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Não foi possível carregar os produtos.");
            }

            produtos = Array.isArray(resultado.produtos) ? resultado.produtos : [];
            select.innerHTML = '<option value="">Selecione um produto...</option>';

            produtos.forEach((produto) => {
                const opcao = document.createElement("option");
                opcao.value = produto.id_produto;
                opcao.textContent = `${produto.nome} (SKU: ${produto.sku || "Sem SKU"})`;
                select.appendChild(opcao);
            });

            if (!produtos.length) {
                select.innerHTML = '<option value="">Nenhum produto cadastrado</option>';
                mostrarMensagem("Não há produtos cadastrados para seleção.", "info");
            }
        } catch (erro) {
            select.innerHTML = '<option value="">Erro ao carregar produtos</option>';
            mostrarMensagem(erro.message);
        }
    }

    function abrirModal(produto) {
        produtoPendente = {
            id_produto: Number(produto.id_produto),
            nome: produto.nome,
            sku: produto.sku,
            quantidade: Number(produto.quantidade_estoque),
            justificativa: justificativa.value.trim()
        };

        modalMensagem.textContent =
            `Você está prestes a solicitar o expurgo de ${produtoPendente.quantidade} unidade(s) de "${produtoPendente.nome}". Esta operação é definitiva. Deseja continuar?`;
        modalOverlay.classList.add("show");
        modalOverlay.setAttribute("aria-hidden", "false");
        modalCancelar.focus();
    }

    function fecharModal() {
        modalOverlay.classList.remove("show");
        modalOverlay.setAttribute("aria-hidden", "true");
        produtoPendente = null;
    }

    select.addEventListener("change", () => {
        mensagemArea.replaceChildren();
        atualizarResumo();
    });

    justificativa.addEventListener("input", () => {
        contadorCaracteres.textContent = `${justificativa.value.length}/255`;
        atualizarBotao();
    });

    confirmacao.addEventListener("change", atualizarBotao);

    formulario.addEventListener("reset", () => {
        window.setTimeout(() => {
            mensagemArea.replaceChildren();
            produtoResumo.hidden = true;
            contadorCaracteres.textContent = "0/255";
            atualizarBotao();
        }, 0);
    });

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        mensagemArea.replaceChildren();

        const produto = obterProdutoSelecionado();
        const motivo = justificativa.value.trim();

        if (!produto) {
            mostrarMensagem("Selecione um produto válido.");
            select.focus();
            return;
        }

        if (!Number.isInteger(Number(produto.quantidade_estoque)) || Number(produto.quantidade_estoque) <= 0) {
            mostrarMensagem("O produto selecionado não possui saldo disponível para expurgo.");
            return;
        }

        if (!motivo) {
            mostrarMensagem("O motivo do expurgo é obrigatório.");
            justificativa.focus();
            return;
        }

        if (!confirmacao.checked) {
            mostrarMensagem("Confirme que está ciente de que o expurgo é definitivo.");
            confirmacao.focus();
            return;
        }

        abrirModal(produto);
    });

    modalCancelar.addEventListener("click", fecharModal);

    solicitacaoPendente = {
        id_produto: Number(produto.id_produto),
        quantidade: qtd,
        justificativa: motivo
    };
    modalConfirmar.addEventListener("click", async () => {
        if (!solicitacaoPendente) return;

        modalConfirmar.disabled = true;
        modalCancelar.disabled = true;
        modalConfirmar.textContent = "Enviando...";

        try {
            const resposta = await fetch("/api/produtos/expurgo", {
                method: "POST",
                headers: obterCabecalhos(),
                body: JSON.stringify(solicitacaoPendente)
            });

            const resultado = await lerResposta(resposta);
            const dados = resultado.dados;

            fecharModal();

            mostrarMensagem(
                `${resultado.mensagem} Produto: ${dados.nome}. Quantidade expurgada: ${dados.quantidade}. Saldo restante: ${dados.saldoNovo}.`,
                "sucesso"
            );

            formulario.reset();
            await carregarProdutos();

        } catch (erro) {
            fecharModal();
            mostrarMensagem(erro.message);

        } finally {
            modalConfirmar.disabled = false;
            modalCancelar.disabled = false;
            modalConfirmar.textContent = "Confirmar expurgo";
        }
    });

    modalOverlay.addEventListener("click", (evento) => {
        if (evento.target === modalOverlay) fecharModal();
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && modalOverlay.classList.contains("show")) {
            fecharModal();
        }
    });

    carregarProdutos();
});
