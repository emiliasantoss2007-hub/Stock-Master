'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const ExcelJS = require('exceljs');
const { gerarRelatorioExcel, CABECALHOS } = require('../../src/services/relatorioExcelService');

const linha = () => [17, 'Fonte de alimentação', 'SKU-001', 'ENTRADA', 12,
    '2026-10-28T15:30:00Z', 'Ana', 'Reposição'];
const preparado = (linhas = [linha()]) => ({ cabecalhos: [...CABECALHOS], linhas, totalRegistros: linhas.length });

async function conferir(dados, verificar, opcoes) {
    const resultado = await gerarRelatorioExcel(dados, opcoes);
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(resultado.caminhoArquivo);
        await verificar(workbook, resultado);
    } finally {
        await resultado.limpar();
        await resultado.limpar(); // idempotente
    }
    await expect(fs.access(resultado.caminhoArquivo)).rejects.toMatchObject({ code: 'ENOENT' });
}

jest.setTimeout(30000);

test('gera XLSX íntegro, oito colunas, valores, tipos e layout de impressão', async () => {
    await conferir(preparado(), async (workbook, resultado) => {
        const aba = workbook.getWorksheet('Movimentações');
        expect(workbook.worksheets).toHaveLength(1);
        expect(aba.rowCount).toBe(2);
        expect(aba.getRow(1).values.slice(1)).toEqual(CABECALHOS);
        expect(aba.getRow(2).values.slice(1)).toEqual([
            17, 'Fonte de alimentação', 'SKU-001', 'ENTRADA', 12,
            new Date('2026-10-28T15:30:00Z'), 'Ana', 'Reposição'
        ]);
        expect(aba.getCell('E2').type).toBe(ExcelJS.ValueType.Number);
        expect(aba.getCell('F2').type).toBe(ExcelJS.ValueType.Date);
        expect(aba.getCell('E2').numFmt).toBe('0');
        expect(aba.getCell('F2').numFmt).toBe('dd/mm/yyyy hh:mm:ss');
        expect(aba.getCell('A1').font.bold).toBe(true);
        expect(aba.getColumn(2).width).toBe(32);
        expect(aba.views[0].ySplit).toBe(1);
        expect(aba.pageSetup).toMatchObject({
            orientation: 'landscape', paperSize: 9, fitToWidth: 1, fitToHeight: 0,
            printTitlesRow: '1:1', printArea: 'A1:H2'
        });
        expect(aba.headerFooter.oddFooter).toContain('&P de &N');
        expect(aba.autoFilter).toBe('A1:H2');
        expect(resultado.metricas.pid).not.toBe(process.pid);
        expect(resultado.totalRegistros).toBe(1);
        expect(await fs.readdir(path.dirname(resultado.caminhoArquivo))).toEqual(['movimentacoes.xlsx']);
        expect(require.cache[require.resolve('../../src/config/database')]).toBeUndefined();
    });
});

test('lista vazia produz aba com cabeçalhos e sem registros inventados', async () => {
    await conferir(preparado([]), workbook => {
        expect(workbook.worksheets).toHaveLength(1);
        expect(workbook.worksheets[0].rowCount).toBe(1);
        expect(workbook.worksheets[0].getRow(1).values.slice(1)).toEqual(CABECALHOS);
    });
});

test('campos vazios preparados permanecem vazios', async () => {
    await conferir(preparado([Array(8).fill('')]), workbook => {
        const aba = workbook.worksheets[0];
        expect(aba.getRow(2).getCell(5).value ?? '').toBe('');
        expect(aba.getRow(2).getCell(6).value ?? '').toBe('');
    });
});

test.each(['2026-10-28', '2026-10-28 15:30:00', new Date('2026-10-28T15:30:00Z')])(
    'normaliza data ISO/SQL/Date sem depender do fuso do host: %s', async data => {
        const registro = linha(); registro[5] = data;
        await conferir(preparado([registro]), workbook => {
            const esperado = typeof data === 'string' && data.length === 10 ? '2026-10-28T00:00:00.000Z' : '2026-10-28T15:30:00.000Z';
            expect(workbook.worksheets[0].getCell('F2').value.toISOString()).toBe(esperado);
        });
    }
);

test('preserva textos perigosos como strings, sem fórmulas ou hyperlinks', async () => {
    const registros = ['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1:A2)', '=HYPERLINK("https://example.com")']
        .map(texto => { const registro = linha(); registro[1] = texto; return registro; });
    await conferir(preparado(registros), workbook => {
        registros.forEach((registro, i) => {
            const cell = workbook.worksheets[0].getCell(`B${i + 2}`);
            expect(cell.value).toBe(registro[1]);
            expect(cell.type).toBe(ExcelJS.ValueType.String);
            expect(cell.formula).toBeUndefined();
            expect(cell.hyperlink).toBeUndefined();
        });
    });
});

test('divide dados em abas, repete cabeçalhos e preserva todos os registros', async () => {
    const registros = Array.from({ length: 5 }, (_, i) => { const registro = linha(); registro[0] = i + 1; return registro; });
    await conferir(preparado(registros), workbook => {
        expect(workbook.worksheets.map(aba => aba.name)).toEqual(['Movimentações', 'Movimentações 2', 'Movimentações 3']);
        const codigos = [];
        for (const aba of workbook.worksheets) {
            expect(aba.getRow(1).values.slice(1)).toEqual(CABECALHOS);
            expect(aba.pageSetup.printTitlesRow).toBe('1:1');
            aba.eachRow((row, i) => { if (i > 1) codigos.push(row.getCell(1).value); });
        }
        expect(codigos).toEqual([1, 2, 3, 4, 5]);
    }, { linhasPorAba: 2 });
});

test.each([null, [], {}, { cabecalhos: CABECALHOS, linhas: {}, totalRegistros: 0 },
    { cabecalhos: [...CABECALHOS].reverse(), linhas: [], totalRegistros: 0 },
    { ...preparado(), totalRegistros: 2 }])('rejeita contrato inválido: %j', async dados => {
    await expect(gerarRelatorioExcel(dados)).rejects.toMatchObject({ code: 'INVALID_DATA' });
});

test.each([
    [1, { formula: '1+1' }], [4, '12'], [4, NaN], [4, -1],
    [5, new Date(NaN)], [4, 1000000000000000], [5, '28/10/2026'], [5, '2026-02-30'], [1, 'a'.repeat(32768)], [1, '\u0000']
])('rejeita célula inválida na coluna %s e remove temporários', async (coluna, valor) => {
    const antes = (await fs.readdir(os.tmpdir())).filter(nome => nome.startsWith('stockmaster-rf19-')).sort();
    const registro = linha(); registro[coluna] = valor;
    await expect(gerarRelatorioExcel(preparado([registro]))).rejects.toMatchObject({ code: 'INVALID_DATA' });
    const depois = (await fs.readdir(os.tmpdir())).filter(nome => nome.startsWith('stockmaster-rf19-')).sort();
    expect(depois).toEqual(antes);
});

test('rejeita linha com menos de oito células e limites inválidos', async () => {
    await expect(gerarRelatorioExcel(preparado([[1]]))).rejects.toMatchObject({ code: 'INVALID_DATA' });
    for (const opcoes of [{ linhasPorAba: 1048576 }, { linhasPorAba: 0 }, { timeoutMs: 0 }, { maxRssMB: 1 }]) {
        await expect(gerarRelatorioExcel(preparado(), opcoes)).rejects.toMatchObject({ code: 'INVALID_OPTIONS' });
    }
});

test('limita concorrência, mantém exportação original e permite nova execução após limpeza', async () => {
    const primeira = gerarRelatorioExcel(preparado());
    await expect(gerarRelatorioExcel(preparado())).rejects.toMatchObject({ code: 'EXPORT_BUSY' });
    const resultado = await primeira;
    await resultado.limpar();
    await conferir(preparado([]), workbook => expect(workbook.worksheets).toHaveLength(1));
});
