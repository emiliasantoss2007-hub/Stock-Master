'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const os = require('node:os');
const { once } = require('node:events');
const { performance } = require('node:perf_hooks');
const ExcelJS = require('exceljs');
const { gerarRelatorioExcel, CABECALHOS } = require('../../src/services/relatorioExcelService');

jest.setTimeout(120000);

test('100 mil registros: filho real, leitura streaming e responsividade HTTP do processo principal', async () => {
    // Dados artificiais exclusivos deste teste; nenhum Model/SQL é carregado.
    const linhas = Array.from({ length: 100000 }, (_, i) => [
        i + 1, `Produto de teste ${i + 1}`, `SKU-${i + 1}`, 'ENTRADA', i % 100 + 1,
        '2026-10-28T15:30:00Z', 'Responsável de teste', `Justificativa controlada ${i + 1}`
    ]);
    const servidor = http.createServer((req, res) => { res.end('ok'); });
    servidor.listen(0, '127.0.0.1');
    await once(servidor, 'listening');
    const porta = servidor.address().port;
    const latencias = [];
    const pendentes = new Set();
    const falhas = [];
    const rssInicial = process.memoryUsage().rss;
    let picoRssPrincipal = rssInicial;
    let resultado;
    function requisitar() {
        const inicio = performance.now();
        const tarefa = new Promise(resolve => {
            const req = http.get({ hostname: '127.0.0.1', port: porta, path: '/' }, res => {
                res.resume();
                res.on('end', () => { latencias.push(performance.now() - inicio); resolve(); });
                res.on('error', erro => { falhas.push(erro.message); resolve(); });
            });
            req.on('error', erro => { falhas.push(erro.message); resolve(); });
            req.setTimeout(5000, () => req.destroy(new Error('HTTP timeout')));
        });
        pendentes.add(tarefa);
        tarefa.finally(() => pendentes.delete(tarefa));
        picoRssPrincipal = Math.max(picoRssPrincipal, process.memoryUsage().rss);
    }
    const inicio = performance.now();
    const timer = setInterval(requisitar, 25);
    try {
        resultado = await gerarRelatorioExcel({ cabecalhos: [...CABECALHOS], linhas, totalRegistros: linhas.length });
    } finally {
        clearInterval(timer);
        await Promise.all([...pendentes]);
        await new Promise(resolve => servidor.close(resolve));
    }
    try {
        const tempoExportacaoMs = Math.round(performance.now() - inicio);
        expect(resultado.metricas.pid).not.toBe(process.pid);
        expect(resultado.totalRegistros).toBe(100000);
        expect(resultado.metricas.picoRssBytes).toBeLessThan(256 * 1024 * 1024);
        expect(falhas).toEqual([]);
        expect(latencias.length).toBeGreaterThan(5);
        expect(Math.max(...latencias)).toBeLessThan(2000);
        const reader = new ExcelJS.stream.xlsx.WorkbookReader(resultado.caminhoArquivo, {
            worksheets: 'emit', sharedStrings: 'cache', styles: 'ignore', hyperlinks: 'ignore'
        });
        let quantidade = 0;
        for await (const aba of reader) {
            for await (const linha of aba) {
                if (linha.number === 1) expect(linha.values.slice(1)).toEqual(CABECALHOS);
                else {
                    quantidade++;
                    expect(linha.getCell(1).value).toBe(quantidade);
                    expect(linha.getCell(5).value).toBe((quantidade - 1) % 100 + 1);
                }
            }
        }
        expect(quantidade).toBe(100000);
        const ordenadas = [...latencias].sort((a, b) => a - b);
        const metricas = {
            node: process.version, plataforma: `${process.platform}/${process.arch}`,
            registros: quantidade, tempoExportacaoMs, ...resultado.metricas,
            tamanhoArquivoBytes: (await fs.stat(resultado.caminhoArquivo)).size,
            rssInicialPrincipalBytes: rssInicial, picoRssPrincipalBytes: picoRssPrincipal,
            crescimentoRssPrincipalBytes: picoRssPrincipal - rssInicial,
            respostasHttp: latencias.length,
            latenciaHttpP95Ms: Number(ordenadas[Math.floor(ordenadas.length * 0.95)].toFixed(2)),
            latenciaHttpMaxMs: Number(Math.max(...latencias).toFixed(2)), falhasHttp: falhas.length
        };
        console.log('RF19_METRICAS ' + JSON.stringify(metricas));
        if (process.env.RF19_METRICS_FILE) await fs.writeFile(process.env.RF19_METRICS_FILE, JSON.stringify(metricas, null, 2));
    } finally {
        await resultado.limpar();
    }
});

test('limite RSS provoca encerramento real do filho, limpa arquivos e permite exportar novamente', async () => {
    const dados = { cabecalhos: [...CABECALHOS], linhas: [], totalRegistros: 0 };
    const listar = async () => (await fs.readdir(os.tmpdir())).filter(nome => nome.startsWith('stockmaster-rf19-')).sort();
    const antes = await listar();
    await expect(gerarRelatorioExcel(dados, { maxRssMB: 32 })).rejects.toMatchObject({ code: 'MEMORY_LIMIT' });
    expect(await listar()).toEqual(antes);
    const resultado = await gerarRelatorioExcel(dados);
    await resultado.limpar();
});
