document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;
    const select = document.querySelector("#produtoSelect");
    const infoEstoque = document.querySelector("#infoEstoque");
    const mensagemArea = document.querySelector("#mensagemArea");
    const form = document.querySelector("#formExpurgo");
    const quantidadeInput = document.querySelector("#quantidade");
    const justificativaInput = document.querySelector("#justificativa");

    const overlay = document.querySelector("#modalOverlay");
    const modalTitulo = document.querySelector("#modalTitulo");
    const modalMensagem = document.querySelector("#modalMensagem");
    const modalCancelar = document.querySelector("#modalCancelar");
    const modalConfirmar = document.querySelector("#modalConfirmar");

    const token = sessionStorage.getItem("stockmaster.accessToken");

    let produtos = [];

    function obterCabecalhos() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    }

    function mostrarMensagem(texto, tipo = "erro") {
        mensagemArea.textContent = texto;
        mensagemArea.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : "mensagem-erro";
    }

    // CARREGAR PRODUTOS DO BANCO
    async function carregarProdutos() {
        try {
            const resposta = await fetch("/api/produtos/expurgo/listar", {
                method: "GET",
                headers: obterCabecalhos()
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao carregar produtos.");
            }

            produtos = resultado.produtos;

            select.innerHTML = '<option value="">Selecione um produto</option>';

            produtos.forEach((produto) => {
                const opcao = document.createElement("option");
                opcao.value = produto.id_produto;
                opcao.textContent = `${produto.nome} (SKU: ${produto.sku})`;
                select.appendChild(opcao);
            });

        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    }

    // MOSTRAR SALDO DISPONÍVEL
    select.addEventListener("change", () => {
        const produto = produtos.find(
            (p) => String(p.id_produto) === String(select.value)
        );

        infoEstoque.textContent = produto
            ? `Estoque disponível: ${produto.quantidade_estoque} unidade(s).`
            : "";
    });

    // ABRIR CONFIRMAÇÃO
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        mensagemArea.textContent = "";

        const produtoId = select.value;
        const quantidade = Number(quantidadeInput.value);
        const justificativa = justificativaInput.value.trim();

        const produto = produtos.find(
            (p) => String(p.id_produto) === String(produtoId)
        );

        if (!produto) {
            mostrarMensagem("Selecione um produto para continuar.");
            return;
        }

        if (
            !Number.isInteger(quantidade) ||
            quantidade <= 0 ||
            quantidade > Number(produto.quantidade_estoque)
        ) {
            mostrarMensagem(
                `Informe uma quantidade válida. Disponível: ${produto.quantidade_estoque}.`
            );
            return;
        }

        if (!justificativa) {
            mostrarMensagem("A justificativa é obrigatória para o expurgo.");
            return;
        }

        modalTitulo.textContent = "Confirmar expurgo";
        modalMensagem.textContent =
            `Confirma o expurgo de ${quantidade} unidade(s) de "${produto.nome}"? Esta ação não pode ser desfeita.`;

        overlay.classList.add("show");
    });

    // CANCELAR CONFIRMAÇÃO
    modalCancelar.onclick = () => {
        overlay.classList.remove("show");
    };

    // CONFIRMAR E REGISTRAR EXPURGO
    modalConfirmar.onclick = async () => {
        const produtoId = select.value;
        const quantidade = Number(quantidadeInput.value);
        const justificativa = justificativaInput.value.trim();

        modalConfirmar.disabled = true;

        try {
            const resposta = await fetch("/api/produtos/expurgo", {
                method: "POST",
                headers: obterCabecalhos(),
                body: JSON.stringify({
                    id_produto: produtoId,
                    quantidade,
                    justificativa
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao registrar expurgo.");
            }

            overlay.classList.remove("show");

            mostrarMensagem(
                resultado.mensagem,
                "sucesso"
            );

            form.reset();
            infoEstoque.textContent = "";

            await carregarProdutos();

        } catch (erro) {
            overlay.classList.remove("show");
            mostrarMensagem(erro.message);
        } finally {
            modalConfirmar.disabled = false;
        }
    };

    // INICIALIZAÇÃO
    if (!token) {
        mostrarMensagem("Sessão não encontrada. Faça login novamente.");
        return;
    }

    carregarProdutos();

});
