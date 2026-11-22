document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;

    const select = document.querySelector("#produtoSelect");
    const infoEstoque = document.querySelector("#infoEstoque");
    const mensagemArea = document.querySelector("#mensagemArea");
    const formulario = document.querySelector("#formEntrada");
    const campoQuantidade = document.querySelector("#quantidade");

    const token = sessionStorage.getItem("stockmaster.accessToken");

    // PREPARAR CABEÇALHOS
    function obterCabecalhos() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    }

    // EXIBIR MENSAGEM
    function mostrarMensagem(texto, tipo) {
        mensagemArea.innerHTML = "";

        const mensagem = document.createElement("p");
        mensagem.className = tipo === "sucesso"
            ? "mensagem-sucesso"
            : "mensagem-erro";

        mensagem.textContent = texto;
        mensagemArea.appendChild(mensagem);
    }

    // CARREGAR PRODUTOS
    async function carregarProdutos() {
        try {
            if (!token) {
              mostrarMensagem("Faça login novamente.", "erro");
              return;
}

            const resposta = await fetch(
                "/api/produtos/entrada/listar",
                { headers: obterCabecalhos() }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao carregar produtos.");
            }

            select.innerHTML =
                '<option value="">Selecione um produto...</option>';

            resultado.produtos.forEach((produto) => {
                const opcao = document.createElement("option");
                opcao.value = produto.id_produto;
                opcao.textContent = `${produto.nome} (SKU: ${produto.sku})`;
                select.appendChild(opcao);
            });
        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    }

    // MOSTRAR SALDO ATUAL
    select.addEventListener("change", async () => {
        infoEstoque.textContent = "";

        if (!select.value) return;

        try {
            const resposta = await fetch(
                "/api/produtos/entrada/listar",
                { headers: obterCabecalhos() }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error("Não foi possível consultar o estoque.");
            }

            const produto = resultado.produtos.find(
                (item) => String(item.id_produto) === select.value
            );

            if (produto) {
                infoEstoque.textContent =
                    `Estoque atual: ${produto.quantidade_estoque} unidade(s).`;
            }
        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    });

    // REGISTRAR ENTRADA
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        mensagemArea.innerHTML = "";

        const idProduto = Number(select.value);
        const quantidade = Number(campoQuantidade.value);

        if (!Number.isInteger(idProduto) || idProduto <= 0) {
            mostrarMensagem("Selecione um produto válido.", "erro");
            return;
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            mostrarMensagem("Informe uma quantidade inteira maior que zero.", "erro");
            return;
        }

        try {
            const resposta = await fetch("/api/produtos/entrada", {
                method: "POST",
                headers: obterCabecalhos(),
                body: JSON.stringify({
                    id_produto: idProduto,
                    quantidade
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem || "Erro ao registrar entrada.");
            }

            mostrarMensagem(resultado.mensagem, "sucesso");
            formulario.reset();
            infoEstoque.textContent = "";

            await carregarProdutos();
        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    });

    // LIMPAR MENSAGENS
    formulario.addEventListener("reset", () => {
        mensagemArea.innerHTML = "";
        infoEstoque.textContent = "";
    });

    // INICIALIZAR
    carregarProdutos();

});