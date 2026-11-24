
"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;

    const select = document.querySelector("#produtoSelect");
    const infoEstoque = document.querySelector("#infoEstoque");
    const mensagemArea = document.querySelector("#mensagemArea");
    const formSaida = document.querySelector("#formSaida");
    const quantidadeInput = document.querySelector("#quantidade");
    const justificativaInput = document.querySelector("#justificativa");

    const token = sessionStorage.getItem("stockmaster.accessToken");

    let produtos = [];


    // ========================================
    // MENSAGENS
    // ========================================

    function exibirMensagem(texto, classe) {
        const mensagem = document.createElement("p");

        mensagem.className = classe;
        mensagem.textContent = texto;

        mensagemArea.appendChild(mensagem);
    }


    // ========================================
    // CONSULTAR PRODUTOS NO BANCO
    // ========================================

    async function carregarProdutos() {

        try {

            if (!token) {
                exibirMensagem(
                    "Sessão não encontrada. Faça login novamente.",
                    "mensagem-erro"
                );
                return;
            }

            const resposta = await fetch(
                "/api/produtos/consulta",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.success) {
                throw new Error(
                    resultado.message || "Não foi possível consultar os produtos."
                );
            }

            produtos = resultado.data.produtos;

            // Preserva a opção inicial do seletor
            const opcaoInicial = select.querySelector('option[value=""]');

            select.innerHTML = "";

            if (opcaoInicial) {
                select.appendChild(opcaoInicial);
            } else {
                const opcao = document.createElement("option");
                opcao.value = "";
                opcao.textContent = "Selecione um produto";
                select.appendChild(opcao);
            }

            produtos.forEach((produto) => {

                const opcao = document.createElement("option");

                opcao.value = produto.idProduto;
                opcao.textContent =
                    `${produto.nome} (SKU: ${produto.sku})`;

                select.appendChild(opcao);
            });

        } catch (erro) {

            console.error("[SaidaEstoque] Erro ao carregar produtos:", erro);

            exibirMensagem(
                erro.message || "Erro ao carregar produtos.",
                "mensagem-erro"
            );
        }
    }


    // ========================================
    // ATUALIZAR ESTOQUE DISPONÍVEL
    // ========================================

    select.addEventListener("change", () => {

        const produto = produtos.find(
            (p) => String(p.idProduto) === String(select.value)
        );

        infoEstoque.textContent = produto
            ? `Estoque disponível: ${produto.quantidadeEstoque} unidade(s).`
            : "";
    });


    // ========================================
    // REGISTRAR SAÍDA DE ESTOQUE
    // ========================================

    formSaida.addEventListener("submit", async (e) => {

        e.preventDefault();

        mensagemArea.innerHTML = "";

        const produtoId = Number(select.value);
        const quantidade = Number(quantidadeInput.value);

        const justificativa = justificativaInput
            ? justificativaInput.value.trim()
            : null;

        // Validação do produto
        if (!produtoId) {
            exibirMensagem(
                "Selecione um produto para continuar.",
                "mensagem-erro"
            );
            return;
        }

        // Validação da quantidade
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            exibirMensagem(
                "Informe uma quantidade inteira maior que zero.",
                "mensagem-erro"
            );
            return;
        }

        const produto = produtos.find(
            (p) => Number(p.idProduto) === produtoId
        );

        if (!produto) {
            exibirMensagem(
                "Produto não encontrado.",
                "mensagem-erro"
            );
            return;
        }

        // RN10: não permitir saída maior que o estoque disponível
        if (quantidade > Number(produto.quantidadeEstoque)) {
            exibirMensagem(
                `Estoque insuficiente. Disponível: ${produto.quantidadeEstoque} unidade(s).`,
                "mensagem-alerta"
            );
            return;
        }

        try {

            const resposta = await fetch(
                "/api/estoque/saida",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        idProduto: produtoId,
                        quantidade,
                        justificativa
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.success) {

                exibirMensagem(
                    resultado.message || "Não foi possível registrar a saída.",
                    resposta.status === 409
                        ? "mensagem-alerta"
                        : "mensagem-erro"
                );

                return;
            }

            // Atualiza o saldo com o valor confirmado pelo backend
            produto.quantidadeEstoque = resultado.data.estoqueAtual;

            infoEstoque.textContent =
                `Estoque disponível: ${produto.quantidadeEstoque} unidade(s).`;

            exibirMensagem(
                `Saída de ${quantidade} unidade(s) de "${produto.nome}" registrada com sucesso!`,
                "mensagem-sucesso"
            );

            // RN: alerta de estoque crítico
            if (Number(produto.quantidadeEstoque) <= Number(produto.estoqueMinimo ?? 5)) {

                exibirMensagem(
                    `Atenção: "${produto.nome}" está com estoque crítico (${produto.quantidadeEstoque} unidade(s)).`,
                    "mensagem-alerta"
                );
            }

            formSaida.reset();

            infoEstoque.textContent = "";

        } catch (erro) {

            console.error("[SaidaEstoque] Erro ao registrar saída:", erro);

            exibirMensagem(
                "Não foi possível registrar a saída. Verifique sua conexão e tente novamente.",
                "mensagem-erro"
            );
        }
    });


    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    carregarProdutos();

});
