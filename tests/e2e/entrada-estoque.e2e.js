const { test, expect } = require('@playwright/test');
const {
    loginComoAdministrador,
    criarProdutoE2E,
    registrarEntrada,
    consultarSaldoDeEntrada
} = require('./helpers/estoque-fixtures');

test('Administrador registra entrada e confirma saldo e histórico', async ({ page }) => {
    await loginComoAdministrador(page);
    const produto = await criarProdutoE2E(page, 5);

    const entrada = await registrarEntrada(page, produto, 4);
    expect(entrada).toMatchObject({
        idProduto: Number(produto.id),
        quantidade: 4,
        saldoAnterior: 5,
        saldoNovo: 9
    });

    await consultarSaldoDeEntrada(page, produto, 9);

    await page.goto('/html/historico_movimentacao.html');
    await expect(page.locator(`#filtroProduto option[value="${produto.id}"]`)).toBeAttached();
    await page.locator('#filtroProduto').selectOption(String(produto.id));
    await page.locator('#filtroTipo').selectOption('ENTRADA');
    await page.locator('#btnFiltrar').click();

    const linhaHistorico = page.locator('#tabelaHistorico tr').filter({ hasText: produto.sku });
    await expect(linhaHistorico).toHaveCount(1);
    await expect(linhaHistorico.locator('td').nth(2)).toHaveText('ENTRADA');
    await expect(linhaHistorico.locator('td').nth(3)).toHaveText('4');
});
