const { test, expect } = require('@playwright/test');

test('Administrador cadastra produto e consulta o registro criado', async ({ page }) => {
    const sku = `E2E-PROD-${Date.now()}`;
    const nome = `Produto E2E ${sku}`;

    await page.goto('/html/login.html');
    await page.locator('#usuario').fill(process.env.E2E_ADMIN_LOGIN);
    await page.locator('#senha').fill(process.env.E2E_ADMIN_PASSWORD);
    await page.locator('#loginForm button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard_adm\.html$/);

    await page.goto('/html/cadastrar_produto.html');
    await expect(page.locator('#productForm')).toBeVisible();
    await page.locator('#nomeProduto').fill(nome);
    await page.locator('#sku').fill(sku);
    await page.locator('#categoria').selectOption('Conectores');
    await page.locator('#valorUnitario').fill('12.50');
    await page.locator('#quantidadeInicial').fill('7');
    await page.locator('#estoqueMinimo').fill('2');
    await page.locator('#descricao').fill(`Registro automatizado identificável: ${sku}`);

    const cadastro = page.waitForResponse((response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/produtos'
    );
    await page.locator('#productForm button[type="submit"]').click();

    const respostaCadastro = await cadastro;
    expect(respostaCadastro.status()).toBe(201);
    const resultado = await respostaCadastro.json();
    expect(resultado.id_produto).toBeGreaterThan(0);

    await expect(page).toHaveURL(/produtos\.html\?cadastro=sucesso$/);
    await page.locator('#searchProduct').fill(sku);

    const linha = page.locator(`#productsTableBody tr[data-product-id="${resultado.id_produto}"]`);
    await expect(linha).toHaveCount(1);
    await expect(linha.locator('td').nth(0)).toContainText(nome);
    await expect(linha.locator('td').nth(1)).toHaveText(sku);
    await expect(linha.locator('td').nth(2)).toHaveText('Conectores');
    await expect(linha.locator('td').nth(3)).toHaveText('7 un.');
});
