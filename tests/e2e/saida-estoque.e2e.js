const { test, expect } = require('@playwright/test');
const {
    loginComoAdministrador,
    criarProdutoE2E,
    registrarSaida
} = require('./helpers/estoque-fixtures');

test('Administrador registra saída e confirma saldo e histórico', async ({ page }) => {
    await loginComoAdministrador(page);
    const produto = await criarProdutoE2E(page, 8);

    const saida = await registrarSaida(page, produto, 3);
    expect(saida).toMatchObject({
        idProduto: Number(produto.id),
        quantidade: 3,
        estoqueAnterior: 8,
        estoqueAtual: 5
    });

    await page.goto('/html/saída_estoque.html');
    await expect(page.locator(`#produtoSelect option[value="${produto.id}"]`)).toBeAttached();
    await page.locator('#produtoSelect').selectOption(String(produto.id));
    await expect(page.locator('#infoEstoque')).toHaveText('Estoque disponível: 5 unidade(s).');

    await page.goto('/html/historico_movimentacao.html');
    await expect(page.locator(`#filtroProduto option[value="${produto.id}"]`)).toBeAttached();
    await page.locator('#filtroProduto').selectOption(String(produto.id));
    await page.locator('#filtroTipo').selectOption('SAIDA');
    await page.locator('#btnFiltrar').click();

    const linhaHistorico = page.locator('#tabelaHistorico tr').filter({ hasText: produto.sku });
    await expect(linhaHistorico).toHaveCount(1);
    await expect(linhaHistorico.locator('td').nth(2)).toHaveText(/SA[IÍ]DA/i);
    await expect(linhaHistorico.locator('td').nth(3)).toHaveText('3');
});
