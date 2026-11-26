const { test, expect } = require('@playwright/test');
const {
    loginComoAdministrador,
    criarProdutoE2E,
    registrarEntrada,
    registrarSaida
} = require('./helpers/estoque-fixtures');

test('Administrador consulta as movimentações do produto criado neste cenário', async ({ page }) => {
    await loginComoAdministrador(page);
    const produto = await criarProdutoE2E(page, 5);

    await registrarEntrada(page, produto, 4, 5);
    await registrarEntrada(page, produto, 4, 9);
    await registrarSaida(page, produto, 3, 13);

    await page.goto('/html/historico_movimentacao.html');
    await expect(page.locator(`#filtroProduto option[value="${produto.id}"]`)).toBeAttached();
    await page.locator('#filtroProduto').selectOption(String(produto.id));
    await page.locator('#btnFiltrar').click();

    const linhasProduto = page.locator('#tabelaHistorico tr').filter({ hasText: produto.sku });
    await expect(linhasProduto).toHaveCount(3);

    const movimentacoes = await linhasProduto.evaluateAll((linhas) =>
        linhas.map((linha) => [
            linha.cells[2].textContent.trim().toUpperCase(),
            linha.cells[3].textContent.trim()
        ])
    );
    const movimentacoesOrdenadas = movimentacoes
        .map(([tipo, quantidade]) => `${tipo}:${quantidade}`)
        .sort();

    expect(movimentacoesOrdenadas).toEqual(['ENTRADA:4', 'ENTRADA:4', 'SAIDA:3']);
});
