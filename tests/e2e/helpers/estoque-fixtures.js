const { randomUUID } = require('node:crypto');
const { expect } = require('@playwright/test');

async function loginComoAdministrador(page) {
    await page.goto('/html/login.html');
    await page.locator('#usuario').fill(process.env.E2E_ADMIN_LOGIN);
    await page.locator('#senha').fill(process.env.E2E_ADMIN_PASSWORD);
    await page.locator('#loginForm button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard_adm\.html$/);
}

async function criarProdutoE2E(page, quantidadeInicial = 0) {
    const sku = `E2E-PROD-${randomUUID().replace(/-/g, '')}`;
    const nome = `Produto E2E ${sku}`;

    await page.goto('/html/cadastrar_produto.html');
    await page.locator('#nomeProduto').fill(nome);
    await page.locator('#sku').fill(sku);
    await page.locator('#categoria').selectOption('Conectores');
    await page.locator('#valorUnitario').fill('12.50');
    await page.locator('#quantidadeInicial').fill(String(quantidadeInicial));
    await page.locator('#estoqueMinimo').fill('1');
    await page.locator('#descricao').fill(`Fixture E2E exclusiva: ${sku}`);

    const cadastro = page.waitForResponse((response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/produtos'
    );
    await page.locator('#productForm button[type="submit"]').click();

    const resposta = await cadastro;
    expect(resposta.status()).toBe(201);
    const resultado = await resposta.json();
    expect(resultado.id_produto).toBeGreaterThan(0);
    await expect(page).toHaveURL(/produtos\.html\?cadastro=sucesso$/);

    return { id: resultado.id_produto, sku, nome, quantidadeInicial };
}

async function registrarEntrada(
    page,
    produto,
    quantidade,
    saldoEsperadoAntes = produto.quantidadeInicial
) {
    await page.goto('/html/entrada_estoque.html');
    await expect(page.locator(`#produtoSelect option[value="${produto.id}"]`)).toBeAttached();
    await page.locator('#produtoSelect').selectOption(String(produto.id));
    await expect(page.locator('#infoEstoque')).toHaveText(
        `Estoque atual: ${saldoEsperadoAntes} unidade(s).`
    );
    await page.locator('#quantidade').fill(String(quantidade));

    const requisicao = page.waitForResponse((response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/produtos/entrada'
    );
    const recargaProdutos = page.waitForResponse((response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/produtos/entrada/listar'
    );
    const opcaoAntesDaRecarga = await page
        .locator(`#produtoSelect option[value="${produto.id}"]`)
        .elementHandle();
    await page.locator('#formEntrada button[type="submit"]').click();
    const resposta = await requisicao;
    expect(resposta.status()).toBe(201);
    const resultado = await resposta.json();
    expect(resultado.sucesso).toBe(true);

    // O reset limpa a mensagem de sucesso; sincroniza pelo estado do formulário.
    await expect(page.locator('#produtoSelect')).toHaveValue('');
    await recargaProdutos;
    await page.waitForFunction((opcao) => !opcao.isConnected, opcaoAntesDaRecarga);
    await expect(page.locator(`#produtoSelect option[value="${produto.id}"]`)).toBeAttached();

    const consultaSaldo = page.waitForResponse((response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/produtos/entrada/listar'
    );
    await page.locator('#produtoSelect').selectOption(String(produto.id));
    await consultaSaldo;
    await expect(page.locator('#infoEstoque')).toHaveText(
        `Estoque atual: ${resultado.dados.saldoNovo} unidade(s).`
    );
    await opcaoAntesDaRecarga.dispose();

    return resultado.dados;
}

async function registrarSaida(
    page,
    produto,
    quantidade,
    saldoEsperadoAntes = produto.quantidadeInicial
) {
    await page.goto('/html/saída_estoque.html');
    await expect(page.locator(`#produtoSelect option[value="${produto.id}"]`)).toBeAttached();
    await page.locator('#produtoSelect').selectOption(String(produto.id));
    await expect(page.locator('#infoEstoque')).toHaveText(
        `Estoque disponível: ${saldoEsperadoAntes} unidade(s).`
    );
    await page.locator('#quantidade').fill(String(quantidade));

    const requisicao = page.waitForResponse((response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/estoque/saida'
    );
    await page.locator('#formSaida button[type="submit"]').click();
    const resposta = await requisicao;
    expect(resposta.status()).toBe(200);
    const resultado = await resposta.json();
    expect(resultado.success).toBe(true);
    await expect(page.locator('#mensagemArea .mensagem-sucesso'))
        .toContainText('registrada com sucesso');

    return resultado.data;
}

async function consultarSaldoDeEntrada(page, produto, quantidadeEsperada) {
    // Uma navegação nova aguarda a conclusão da atualização feita pela tela de entrada.
    await page.goto('/html/entrada_estoque.html');
    await expect(page.locator(`#produtoSelect option[value="${produto.id}"]`)).toBeAttached();

    const consultaSaldo = page.waitForResponse((response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/produtos/entrada/listar'
    );
    await page.locator('#produtoSelect').selectOption(String(produto.id));
    await consultaSaldo;
    await expect(page.locator('#infoEstoque')).toHaveText(
        `Estoque atual: ${quantidadeEsperada} unidade(s).`
    );
}

module.exports = {
    loginComoAdministrador,
    criarProdutoE2E,
    registrarEntrada,
    registrarSaida,
    consultarSaldoDeEntrada
};
