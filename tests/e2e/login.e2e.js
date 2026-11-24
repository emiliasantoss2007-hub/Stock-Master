const { test, expect } = require('@playwright/test');

test('abre a aplicação e permite login do Administrador de teste', async ({ page }) => {
    await page.goto('/html/login.html');
    await expect(page).toHaveTitle(/Stock ?Master\s*\|\s*Login/i);

    await page.locator('#usuario').fill(process.env.E2E_ADMIN_LOGIN);
    await page.locator('#senha').fill(process.env.E2E_ADMIN_PASSWORD);
    await page.locator('#loginForm button[type="submit"]').click();

    await expect(page).toHaveURL(/dashboard_adm\.html$/);
    await expect(page.locator('.sidebar-nav a[href^="relatorios.html"]')).toBeVisible();
});

test('permite login do Técnico de teste no dashboard correspondente', async ({ page }) => {
    await page.goto('/html/login.html');
    await page.locator('#usuario').fill(process.env.E2E_TECH_LOGIN);
    await page.locator('#senha').fill(process.env.E2E_TECH_PASSWORD);
    await page.locator('#loginForm button[type="submit"]').click();

    await expect(page).toHaveURL(/dashboard_tec\.html$/);
    await expect(page.locator('.sidebar-nav a[href^="produtos.html"]')).toBeVisible();
    await expect(page.locator('.sidebar-nav a[href^="relatorios.html"]')).toHaveCount(0);
});
