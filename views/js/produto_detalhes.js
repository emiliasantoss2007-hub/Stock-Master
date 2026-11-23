document.addEventListener("DOMContentLoaded", async () => {
    if (!await configurarNavegacaoDaSessao()) return;
    const idProduto = new URLSearchParams(window.location.search).get("id");
    document.querySelector("#editarProdutoLink").href = "editar_produto.html?id=" + encodeURIComponent(idProduto ?? "");


});