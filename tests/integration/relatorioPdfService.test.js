const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');
const { prepararDadosRelatorioPdf } = require('../../src/models/relatorioPdfModel');
const { gerarRelatorioPdf } = require('../../src/services/relatorioPdfService');

const executar = promisify(execFile);
const cabecalhos = ['Código', 'Produto', 'SKU', 'Tipo de movimentação', 'Quantidade', 'Data', 'Responsável', 'Justificativa'];
const amostra = {
    id_movimentacao: '00042', nome_produto: 'Cafeteira', sku_produto: '00123', tipo_movimentacao: 'SAÍDA',
    quantidade: 0, data_movimentacao: '2026-09-08T14:30:09.123-03:00', nome_responsavel: 'João Gonçalves',
    justificativa: 'Reposição — preço €20; <script>alert(1)</script>'
};

async function lerPdf(arquivo) {
    const leitor = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
    const { stdout } = await executar(process.execPath, ['-e', `
        const { readFileSync } = require('node:fs');
        const { pathToFileURL } = require('node:url');
        (async () => {
            const { getDocument } = await import(pathToFileURL(process.argv[1]).href);
            const tarefa = getDocument({ data: new Uint8Array(readFileSync(process.argv[2])) });
            try {
                const pdf = await tarefa.promise;
                const paginas = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const pagina = await pdf.getPage(i);
                    paginas.push({ dimensoes: pagina.view, texto: (await pagina.getTextContent()).items.map(item => item.str).join(' ') });
                    pagina.cleanup();
                }
                process.stdout.write(JSON.stringify(paginas));
            } finally {
                await tarefa.destroy();
            }
        })().catch(error => { console.error(error); process.exitCode = 1; });
    `, leitor, arquivo], { maxBuffer: 8 * 1024 * 1024, windowsHide: true });
    return JSON.parse(stdout);
}

async function temporarios() {
    return (await fs.readdir(os.tmpdir())).filter(nome => nome.startsWith('stockmaster-rf20-')).sort();
}

jest.setTimeout(90000);

test('gera e reabre um PDF A4 paisagem com oito colunas, acentos, dígitos e dados da entrada', async () => {
    const registro = Object.freeze({ ...amostra });
    const dados = prepararDadosRelatorioPdf(Object.freeze([registro]));
    Object.freeze(dados.linhas[0]);
    Object.freeze(dados.linhas);
    const resultado = await gerarRelatorioPdf(Object.freeze(dados));
    try {
        const bytes = await fs.readFile(resultado.caminhoArquivo);
        expect(bytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
        expect(bytes.subarray(-16).toString('ascii')).toMatch(/%%EOF\s*$/);
        const [pagina] = await lerPdf(resultado.caminhoArquivo);
        expect(pagina.dimensoes[2]).toBeCloseTo(841.89, 1);
        expect(pagina.dimensoes[3]).toBeCloseTo(595.28, 1);
        const texto = pagina.texto.replace(/\s+/gu, ' ');
        expect(texto).toContain('Relatório de movimentações de estoque');
        expect(texto).toContain(cabecalhos.join(' '));
        expect(texto).toContain('00042 Cafeteira 00123 SAÍDA 0 08/09/2026 17:30:09.123 João Gonçalves');
        expect(texto).toContain(amostra.justificativa);
        expect(texto).toContain('Página 1');
        expect(resultado.metricas.pid).not.toBe(process.pid);
        expect(registro).toEqual(amostra);
    } finally {
        await Promise.all([resultado.limpar(), resultado.limpar()]);
    }
    await expect(fs.stat(path.dirname(resultado.caminhoArquivo))).rejects.toMatchObject({ code: 'ENOENT' });
});

test('continua um campo longo em novas páginas sem perder trechos ou o próximo registro', async () => {
    const marcadores = Array.from({ length: 170 }, (_, i) => `TRECHO-${String(i).padStart(3, '0')}`);
    const registros = [
        { ...amostra, justificativa: marcadores.join('\n') },
        { ...amostra, id_movimentacao: 'REGFINAL', justificativa: null }
    ];
    const resultado = await gerarRelatorioPdf(prepararDadosRelatorioPdf(registros));
    try {
        const paginas = await lerPdf(resultado.caminhoArquivo);
        expect(paginas.length).toBeGreaterThan(3);
        expect(paginas).toHaveLength(resultado.metricas.paginas);
        paginas.forEach(({ texto }, indice) => {
            expect(texto.replace(/\s+/gu, ' ')).toContain(cabecalhos.join(' '));
            expect(texto).toContain(`Página ${indice + 1}`);
        });
        const texto = paginas.map(pagina => pagina.texto).join(' ');
        expect(texto.match(/TRECHO-\d{3}/gu)).toEqual(marcadores);
        expect(texto.match(/REGFINAL/gu)).toHaveLength(1);
        expect(texto).toContain('—');
    } finally {
        await resultado.limpar();
    }
});

test('gera relatório vazio com cabeçalhos e mensagem de estado', async () => {
    const resultado = await gerarRelatorioPdf(prepararDadosRelatorioPdf([]));
    try {
        const paginas = await lerPdf(resultado.caminhoArquivo);
        expect(paginas).toHaveLength(1);
        expect(paginas[0].texto.replace(/\s+/gu, ' ')).toContain(cabecalhos.join(' '));
        expect(paginas[0].texto).toContain('Nenhuma movimentação encontrada.');
    } finally {
        await resultado.limpar();
    }
});

test('limpa os temporários em falhas de validação, geração, timeout e cancelamento', async () => {
    const antes = await temporarios();
    const dados = prepararDadosRelatorioPdf([amostra]);
    await expect(gerarRelatorioPdf({ ...dados, linhas: [[{}]] })).rejects.toMatchObject({ code: 'INVALID_DATA' });
    const invalido = prepararDadosRelatorioPdf([{ ...amostra, nome_produto: 'Produto 🚀' }]);
    await expect(gerarRelatorioPdf(invalido)).rejects.toMatchObject({ code: 'UNSUPPORTED_TEXT' });
    await expect(gerarRelatorioPdf(dados, { timeoutMs: 1 })).rejects.toMatchObject({ code: 'EXPORT_TIMEOUT' });

    const controller = new AbortController();
    const muitosRegistros = prepararDadosRelatorioPdf(Array.from({ length: 3000 }, () => amostra));
    const pendente = gerarRelatorioPdf(muitosRegistros, { signal: controller.signal });
    // A saída temporária confirma que o worker já começou quando sinalizamos o cancelamento.
    const interrompido = expect(pendente).rejects.toMatchObject({ code: 'EXPORT_ABORTED' });
    try {
        const prazo = Date.now() + 10000;
        let iniciou = false;
        while (!iniciou && Date.now() < prazo) {
            for (const pasta of (await temporarios()).filter(nome => !antes.includes(nome))) {
                iniciou = (await fs.readdir(path.join(os.tmpdir(), pasta))).includes('relatorio-movimentacoes.pdf');
            }
            await new Promise(resolve => setTimeout(resolve, 25));
        }
        expect(iniciou).toBe(true);
    } finally {
        controller.abort();
        await interrompido;
    }
    expect(await temporarios()).toEqual(antes);
});

test('limita a concorrência e reabre 5.000 movimentações na ordem original', async () => {
    const codigos = Array.from({ length: 5000 }, (_, i) => `MOV-${String(i).padStart(5, '0')}`);
    const dados = prepararDadosRelatorioPdf(codigos.map(id_movimentacao => ({
        ...amostra, id_movimentacao, justificativa: 'Reposição de estoque'
    })));
    const pendente = gerarRelatorioPdf(dados);
    await expect(gerarRelatorioPdf(dados)).rejects.toMatchObject({ code: 'EXPORT_BUSY' });
    const resultado = await pendente;
    try {
        expect(resultado.metricas.registros).toBe(codigos.length);
        expect(resultado.metricas.pid).not.toBe(process.pid);
        const paginas = await lerPdf(resultado.caminhoArquivo);
        expect(paginas.length).toBeGreaterThan(100);
        expect(paginas).toHaveLength(resultado.metricas.paginas);
        expect(paginas.flatMap(({ texto }) => texto.match(/MOV-\d{5}/gu) ?? [])).toEqual(codigos);
    } finally {
        await resultado.limpar();
    }
});
