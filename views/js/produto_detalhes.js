
document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;

    const idProduto = new URLSearchParams(window.location.search).get("id");

    const elementos = {
        nome: document.querySelector("#produtoNome"),
        resumo: document.querySelector("#produtoResumo"),
        sku: document.querySelector("#produtoSku"),
        categoria: document.querySelector("#produtoCategoria"),
        codigoBarras: document.querySelector("#produtoCodigoBarras"),
        valor: document.querySelector("#produtoValor"),
        quantidade: document.querySelector("#produtoQuantidade"),
        estoqueMinimo: document.querySelector("#produtoEstoqueMinimo"),
        situacao: document.querySelector("#produtoSituacao"),
        descricao: document.querySelector("#produtoDescricao"),
        editar: document.querySelector("#editarProdutoLink")
    };

    function mostrarErro(mensagem) {
        elementos.nome.textContent = "Produto indisponível";
        elementos.resumo.textContent = mensagem;
    }

    if (!idProduto || !/^[1-9]\d*$/.test(idProduto)) {
        mostrarErro("Identificador do produto inválido.");
        elementos.editar.style.display = "none";
        return;
    }

    elementos.editar.href =
        `editar_produto.html?id=${encodeURIComponent(idProduto)}`;

    try {
        const resposta = await fetch(
            `/api/produtos/${encodeURIComponent(idProduto)}`
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.success || !resultado.data) {
            mostrarErro(
                resultado.message || "Não foi possível localizar o produto."
            );
            elementos.editar.style.display = "none";
            return;
        }

        const produto = resultado.data;

        elementos.nome.textContent = produto.nome || "Sem nome";
        elementos.resumo.textContent =
            produto.categoria || "Categoria não informada";

        elementos.sku.textContent = produto.sku || "Não informado";
        elementos.categoria.textContent =
            produto.categoria || "Não informada";

        elementos.codigoBarras.textContent =
            produto.codigo_barras || "Não informado";

        elementos.valor.textContent =
            Number(produto.valor || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        elementos.quantidade.textContent =
            `${Number(produto.quantidade_estoque || 0)} unidades`;

        elementos.estoqueMinimo.textContent =
            `${Number(produto.estoque_minimo || 0)} unidades`;

        const quantidade = Number(produto.quantidade_estoque || 0);

        elementos.situacao.textContent =
            quantidade > 0 ? "Disponível" : "Sem estoque";

        elementos.descricao.textContent =
            produto.descricao || "Nenhuma descrição cadastrada.";

    } catch (erro) {
        console.error("Erro ao carregar detalhes do produto:", erro);
        mostrarErro("Erro de comunicação ao consultar o produto.");
        elementos.editar.style.display = "none";
    }
});