'use strict';

const fs = require('node:fs');
const readline = require('node:readline');
const { once } = require('node:events');
const { performance } = require('node:perf_hooks');
const ExcelJS = require('exceljs');

const [entrada, saida, limiteTexto, configTexto] = process.argv.slice(2);
const limite = Number(limiteTexto);

let config;

try {
    config = JSON.parse(configTexto);
    if (
        !Array.isArray(config.cabecalhos) ||
        config.cabecalhos.length === 0 ||
        config.cabecalhos.length > 50
    ) {
        throw new Error('Configuração inválida.');
    }
} catch {
    process.exit(1);
}

const {
    cabecalhos,
    nomeAba = 'Relatório',
    larguras = [],
    colunasData = [],
    colunasInteiras = [],
    colunasMoeda = []
} = config;

let picoRssBytes = process.memoryUsage().rss;
let picoHeapBytes = process.memoryUsage().heapUsed;

function amostrar() {
    const memoria = process.memoryUsage();
    picoRssBytes = Math.max(picoRssBytes, memoria.rss);
    picoHeapBytes = Math.max(picoHeapBytes, memoria.heapUsed);

    if (process.connected) {
        process.send({ tipo: 'memoria', rss: memoria.rss });
    }
}

function dataExcel(valor) {
    if (!valor) return null;
    if (valor instanceof Date) return valor;

    if (valor.length === 10) {
        return new Date(`${valor}T00:00:00Z`);
    }

    return new Date(
        /Z$|[+-]\d{2}:\d{2}$/.test(valor)
            ? valor
            : `${valor.replace(' ', 'T')}Z`
    );
}

async function gerar() {
    const inicio = performance.now();
    const destino = fs.createWriteStream(saida, {
        flags: 'wx',
        mode: 0o600
    });

    const terminou = once(destino, 'finish');
    terminou.catch(() => {});

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        stream: destino,
        useStyles: true,
        useSharedStrings: false,
        zip: { zlib: { level: 1 } }
    });

    workbook.creator = 'StockMaster';

    let aba;
    let numeroAba = 0;
    let linhasNaAba = 0;
    let totalRegistros = 0;

    function novaAba() {
        numeroAba++;

        const nome = numeroAba === 1
            ? nomeAba
            : `${nomeAba} ${numeroAba}`;

        aba = workbook.addWorksheet(nome.slice(0, 31), {
            views: [{ state: 'frozen', ySplit: 1 }],
            pageSetup: {
                paperSize: 9,
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                printTitlesRow: '1:1',
                margins: {
                    left: 0.25,
                    right: 0.25,
                    top: 0.5,
                    bottom: 0.5,
                    header: 0.2,
                    footer: 0.2
                }
            },
            headerFooter: {
                oddFooter: '&LStockMaster&C&P de &N'
            }
        });

        aba.columns = cabecalhos.map((_, i) => {
            let numFmt = '@';

            if (colunasData.includes(i)) {
                numFmt = 'dd/mm/yyyy hh:mm:ss';
            } else if (colunasInteiras.includes(i)) {
                numFmt = '0';
            } else if (colunasMoeda.includes(i)) {
                numFmt = '"R$" #,##0.00';
            }

            return {
                width: larguras[i] || 22,
                style: {
                    font: { name: 'Calibri', size: 11 },
                    alignment: {
                        vertical: 'top',
                        wrapText: true
                    },
                    numFmt
                }
            };
        });

        const cabecalho = aba.addRow([...cabecalhos]);
        cabecalho.height = 30;

        cabecalho.eachCell(cell => {
            cell.font = {
                name: 'Calibri',
                size: 11,
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };

            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF17365D' }
            };
        });

        cabecalho.commit();
        linhasNaAba = 0;
    }

    function fecharAba() {
        const ultimaColuna = aba.getColumn(cabecalhos.length).letter;
        const ultimaLinha = linhasNaAba + 1;

        aba.autoFilter = {
            from: 'A1',
            to: `${ultimaColuna}${ultimaLinha}`
        };

        aba.pageSetup.printArea = `A1:${ultimaColuna}${ultimaLinha}`;
        aba.commit();
    }

    novaAba();

    const origem = fs.createReadStream(entrada, {
        encoding: 'utf8',
        highWaterMark: 64 * 1024
    });

    const leitor = readline.createInterface({
        input: origem,
        crlfDelay: Infinity
    });

    origem.on('error', erro => leitor.emit('error', erro));

    try {
        for await (const texto of leitor) {
            if (linhasNaAba === limite) {
                fecharAba();
                novaAba();
            }

            const valores = JSON.parse(texto);

            if (
                !Array.isArray(valores) ||
                valores.length !== cabecalhos.length
            ) {
                throw new Error('Quantidade de colunas incompatível.');
            }

            for (const indice of colunasData) {
                valores[indice] = dataExcel(valores[indice]);
            }

            for (const indice of colunasInteiras) {
                if (
                    typeof valores[indice] === 'number' &&
                    valores[indice] > 999999999999999
                ) {
                    valores[indice] = String(valores[indice]);
                }
            }

            aba.addRow(valores).commit();

            linhasNaAba++;
            totalRegistros++;

            if (totalRegistros % 128 === 0) {
                amostrar();
                await new Promise(resolve => setImmediate(resolve));
            }
        }

        fecharAba();
        await workbook.commit();
        await terminou;

        amostrar();

        const { maxRSS } = process.resourceUsage();

        return {
            tipo: 'concluido',
            totalRegistros,
            metricas: {
                pid: process.pid,
                abas: numeroAba,
                duracaoGeracaoMs: Math.round(
                    performance.now() - inicio
                ),
                picoRssBytes: Math.max(
                    picoRssBytes,
                    maxRSS * 1024
                ),
                picoHeapBytes
            }
        };
    } finally {
        leitor.close();
        origem.destroy();
        destino.destroy();
    }
}

const monitor = setInterval(amostrar, 200);
amostrar();

gerar()
    .then(resultado => {
        clearInterval(monitor);
        process.send(resultado, () => process.disconnect());
    })
    .catch(erro => {
        clearInterval(monitor);
        process.exitCode = 1;

        if (process.connected) {
            process.send(
                { tipo: 'erro', message: erro.message },
                () => process.exit(1)
            );
        } else {
            process.exit(1);
        }
    });
