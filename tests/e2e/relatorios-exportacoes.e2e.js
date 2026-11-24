const { test, expect } = require('@playwright/test');
const ExcelJS = require('exceljs');
const {
    loginComoAdministrador,
    criarProdutoE2E,
    registrarEntrada,
    registrarSaida
} = require('./helpers/estoque-fixtures');

async function abrirRelatorioDeEstoque(page) {
    await loginComoAdministrador(page);
    const produto = await criarProdutoE2E(page, 7);
    await page.goto('/html/relatorios.html');
    await page.locator('#tipoRelatorio').selectOption('estoque');
    await page.locator('#filtroBuscaEstoque').fill(produto.sku);

    const consulta = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return url.pathname === '/api/relatorios/estoque' &&
            url.searchParams.get('busca') === produto.sku;
    });
    await page.locator('#formRelatorio button[type="submit"]').click();

    const respostaConsulta = await consulta;
    expect(respostaConsulta.status()).toBe(200);
    const resultadoConsulta = await respostaConsulta.json();
    expect(resultadoConsulta.sucesso).toBe(true);
    expect(resultadoConsulta.dados.itens).toHaveLength(1);
    expect(resultadoConsulta.dados.itens[0]).toMatchObject({
        sku: produto.sku,
        quantidadeEstoque: produto.quantidadeInicial
    });

    await expect(page.locator('#visualizarRelatorioArea')).toBeVisible();
    await page.locator('#btnVisualizarRelatorio').click();
    const linhaRelatorio = page.locator('#relatorioCorpo tr').filter({ hasText: produto.sku });
    await expect(linhaRelatorio).toHaveCount(1);
    await expect(linhaRelatorio.locator('td').nth(3))
        .toHaveText(String(produto.quantidadeInicial));
    return { linhaRelatorio, produto };
}

async function extrairTextoPdf(buffer) {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const tarefaPdf = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true
    });
    const documento = await tarefaPdf.promise;

    try {
        const textos = [];
        for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina++) {
            const pagina = await documento.getPage(numeroPagina);
            const conteudo = await pagina.getTextContent();
            textos.push(...conteudo.items.map((item) => item.str));
        }
        return textos.join(' ');
    } finally {
        await tarefaPdf.destroy();
    }
}

test('gera o relatório de produtos cadastrados com dados do banco de teste', async ({ page }) => {
    await loginComoAdministrador(page);
    const produtoCriado = await criarProdutoE2E(page, 7);
    await page.goto('/html/relatorio_produtos.html');

    const requisicao = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/api/relatorio/produtos'
    );
    await page.locator('#generateProductReport').click();

    const resposta = await requisicao;
    expect(resposta.status()).toBe(200);
    const produtos = await resposta.json();
    const produtoE2E = produtos.find((produto) => produto.sku === produtoCriado.sku);
    expect(produtoE2E).toMatchObject({
        sku: produtoCriado.sku,
        quantidade_estoque: produtoCriado.quantidadeInicial
    });

    const linha = page.locator('#productReportRows tr').filter({ hasText: produtoCriado.sku });
    await expect(linha).toHaveCount(1);
    await expect(linha.locator('td').nth(0)).toContainText(produtoE2E.nome);
    await expect(linha.locator('td').nth(4))
        .toHaveText(String(produtoCriado.quantidadeInicial));
});

test('gera o relatório das movimentações do produto criado neste cenário', async ({ page }) => {
    await loginComoAdministrador(page);
    const produto = await criarProdutoE2E(page, 5);
    await registrarEntrada(page, produto, 4, 5);
    await registrarEntrada(page, produto, 4, 9);
    await registrarSaida(page, produto, 3, 13);

    await page.goto('/html/relatorios.html');
    await page.locator('#tipoRelatorio').selectOption('movimentacoes');
    await page.locator('#formRelatorio button[type="submit"]').click();
    await expect(page.locator('#visualizarRelatorioArea')).toBeVisible();
    await page.locator('#btnVisualizarRelatorio').click();

    const movimentacoesE2E = page.locator('#relatorioCorpo tr')
        .filter({ hasText: produto.sku });
    await expect(movimentacoesE2E).toHaveCount(3);

    const tiposQuantidades = await movimentacoesE2E.evaluateAll((linhas) =>
        linhas.map((linha) => [
            linha.cells[3].textContent.trim().toUpperCase(),
            linha.cells[4].textContent.trim()
        ]).map(([tipo, quantidade]) => `${tipo}:${quantidade}`).sort()
    );
    expect(tiposQuantidades).toEqual([
        'ENTRADA:4',
        'ENTRADA:4',
        'SAIDA:3'
    ]);
});

test('exporta PDF legível com os dados exibidos no relatório de estoque', async ({ page }) => {
    const { linhaRelatorio: linha, produto } = await abrirRelatorioDeEstoque(page);
    const valoresExibidos = await linha.locator('td').allTextContents();

    const respostaExportacao = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/api/relatorio/estoque/pdf'
    );
    const downloadArquivo = page.waitForEvent('download');
    await page.locator('#btnExportarPdf').click();

    const resposta = await respostaExportacao;
    const download = await downloadArquivo;
    expect(resposta.status()).toBe(200);
    expect(resposta.headers()['content-type']).toContain('application/pdf');
    expect(resposta.headers()['content-disposition']).toMatch(/^attachment/i);
    expect(await download.suggestedFilename()).toBe('relatorio-estoque.pdf');

    const arquivo = await resposta.body();
    expect(arquivo.subarray(0, 5).toString()).toBe('%PDF-');
    const textoPdf = await extrairTextoPdf(arquivo);
    const textoPdfSemEspacos = textoPdf.replace(/\s+/g, '');
    expect(textoPdfSemEspacos).toContain(produto.sku);
    expect(textoPdfSemEspacos).toContain(valoresExibidos[3]);
    await expect(page.locator('#mensagemArea'))
        .toHaveText('Download do arquivo PDF iniciado.');
});

test('exporta Excel aberto com os dados exibidos no relatório de estoque', async ({ page }) => {
    const { produto } = await abrirRelatorioDeEstoque(page);

    const respostaExportacao = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/api/relatorio/estoque/excel'
    );
    const downloadArquivo = page.waitForEvent('download');
    await page.locator('#btnExportarExcel').click();

    const resposta = await respostaExportacao;
    const download = await downloadArquivo;
    expect(resposta.status()).toBe(200);
    expect(resposta.headers()['content-type'])
        .toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(resposta.headers()['content-disposition']).toMatch(/^attachment/i);
    expect(await download.suggestedFilename()).toBe('relatorio-estoque.xlsx');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await resposta.body());
    const worksheet = workbook.worksheets[0];
    expect(worksheet).toBeDefined();
    const linhaExportada = worksheet.getRows(2, worksheet.rowCount - 1)
        .find((linha) => linha.getCell(2).text === produto.sku);
    expect(linhaExportada).toBeDefined();
    expect(Number(linhaExportada.getCell(5).value)).toBe(produto.quantidadeInicial);
    await expect(page.locator('#statusExportarExcel'))
        .toHaveText('Download do arquivo Excel iniciado.');
});
