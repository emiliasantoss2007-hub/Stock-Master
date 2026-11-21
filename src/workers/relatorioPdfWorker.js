const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { once } = require('node:events');
const { createInterface } = require('node:readline');
const { pipeline } = require('node:stream/promises');
const { setImmediate: cederControle } = require('node:timers/promises');
const { PDFDocument } = require('pdfkit');
const fontkit = require('fontkit');

const [entrada, saida] = process.argv.slice(2);
const fonte = require.resolve('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff');
const fonteNegrito = require.resolve('@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff');
const MAPA_FONTE = fontkit.openSync(fonte);
const segmentador = new Intl.Segmenter('pt-BR', { granularity: 'grapheme' });
const MARGEM = 32;
const RECUO = 6;
const ALTURA_LINHA = 13;
const FUNDO_CABECALHO = '#17365D';
const TITULO = 'Relatório de movimentações de estoque';

function formatarCelula(valor, indice) {
    if (valor === null) return '—';
    const texto = String(valor);
    if (indice !== 5) return texto;

    const iso = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/u;
    if (!iso.test(texto)) return texto;
    const comFuso = /Z$|[+-]\d{2}:\d{2}$/u.test(texto);
    const data = new Date(texto.length === 10 ? texto : texto.replace(' ', 'T') + (comFuso ? '' : 'Z'));
    if (!Number.isFinite(data.getTime()) || new Date(texto.slice(0, 10)).toISOString().slice(0, 10) !== texto.slice(0, 10)) {
        return texto;
    }
    const utc = data.toISOString();
    const fracao = texto.match(/:\d{2}(\.\d+)/u)?.[1].replace(/0+$/u, '');
    return `${utc.slice(8, 10)}/${utc.slice(5, 7)}/${utc.slice(0, 4)} ${utc.slice(11, 19)}${fracao?.length > 1 ? fracao : ''}`;
}

function quebrarTexto(doc, texto, largura) {
    const linhas = [];
    const normalizado = texto.normalize('NFC').replaceAll('\t', '    ');
    for (const paragrafo of normalizado.split(/\r\n?|\n/u)) {
        for (const caractere of paragrafo) {
            if (!MAPA_FONTE.hasGlyphForCodePoint(caractere.codePointAt(0))) {
                throw Object.assign(new Error('O relatório contém caracteres fora da fonte incorporada.'),
                    { code: 'UNSUPPORTED_TEXT' });
            }
        }
        if (doc.widthOfString(paragrafo) <= largura) {
            linhas.push(paragrafo);
            continue;
        }

        let linha = '';
        for (const palavra of paragrafo.match(/\S+\s*|\s+/gu) ?? []) {
            if (doc.widthOfString((linha + palavra).trimEnd()) <= largura) {
                linha += palavra;
                continue;
            }
            if (linha) linhas.push(linha.trimEnd());
            linha = '';
            for (const { segment } of segmentador.segment(palavra)) {
                if (linha && doc.widthOfString((linha + segment).trimEnd()) > largura) {
                    linhas.push(linha.trimEnd());
                    linha = '';
                }
                linha += segment;
            }
        }
        linhas.push(linha.trimEnd());
    }
    return linhas;
}

function criarTabela(doc, titulos) {
    const larguras = [68, 122, 82, 84, 70, 100, 104, 147];
    const larguraTabela = larguras.reduce((total, largura) => total + largura, 0);
    let pagina = 0;
    let topo;
    const desenhar = (celulas, linhas, fundo, cor) => {
        const altura = linhas * ALTURA_LINHA + RECUO * 2;
        doc.rect(MARGEM, topo, larguraTabela, altura).fill(fundo);
        doc.fillColor(cor);
        let x = MARGEM;
        for (const [indice, textos] of celulas.entries()) {
            const largura = larguras[indice];
            for (const [linha, texto] of textos.entries()) {
                const inicio = indice === 4 ? x + largura - RECUO - doc.widthOfString(texto) : x + RECUO;
                doc.text(texto, inicio, topo + RECUO + linha * ALTURA_LINHA, { lineBreak: false });
            }
            x += largura;
        }
        doc.strokeColor('#D5DDE7').lineWidth(0.4).moveTo(MARGEM, topo + altura)
            .lineTo(MARGEM + larguraTabela, topo + altura).stroke();
        topo += altura;
    };
    const novaPagina = () => {
        doc.addPage();
        pagina++;
        doc.font('negrito').fontSize(17).fillColor(FUNDO_CABECALHO)
            .text(TITULO, MARGEM, 30, { lineBreak: false });
        doc.font('normal').fontSize(9).fillColor('#42566C')
            .text('StockMaster  |  Datas formatadas em UTC', MARGEM, 57, { lineBreak: false });
        doc.text(`Página ${pagina}`, MARGEM, doc.page.height - 35, { lineBreak: false });
        topo = 79;
        doc.font('negrito').fontSize(9);
        const cabecalho = titulos.map((titulo, indice) => quebrarTexto(doc, titulo, larguras[indice] - 2 * RECUO));
        desenhar(cabecalho, Math.max(...cabecalho.map(linhas => linhas.length)), FUNDO_CABECALHO, '#FFFFFF');
        doc.font('normal').fontSize(9);
    };
    const capacidade = () => Math.floor((doc.page.height - 56 - topo - 2 * RECUO) / ALTURA_LINHA);
    novaPagina();
    const capacidadePagina = capacidade();

    return {
        escrever(linha, indice) {
            const celulas = linha.map((valor, i) => quebrarTexto(doc, formatarCelula(valor, i), larguras[i] - 2 * RECUO));
            const altura = Math.max(...celulas.map(textos => textos.length));
            if (altura <= capacidadePagina && altura > capacidade()) novaPagina();
            for (let inicio = 0; inicio < altura;) {
                if (capacidade() < 1) novaPagina();
                const quantidade = Math.min(capacidade(), altura - inicio);
                desenhar(celulas.map(textos => textos.slice(inicio, inicio + quantidade)),
                    quantidade, indice % 2 ? '#EEF3F8' : '#FFFFFF', '#182838');
                inicio += quantidade;
            }
        },
        vazio() {
            doc.fillColor('#42566C').text('Nenhuma movimentação encontrada.', MARGEM + RECUO,
                topo + RECUO, { lineBreak: false });
        },
        get paginas() { return pagina; }
    };
}

const controle = new AbortController();
let prazoDesconexao;
const interromper = () => {
    prazoDesconexao = setTimeout(() => process.exit(1), 5000);
    controle.abort();
};
process.once('disconnect', interromper);

async function gerar(sinal) {
    const doc = new PDFDocument({
        autoFirstPage: false, size: 'A4', layout: 'landscape', margin: 0,
        fontLayoutCache: false, info: { Title: TITULO, Creator: 'StockMaster' }
    });
    doc.registerFont('normal', fonte).registerFont('negrito', fonteNegrito);
    const destino = fs.createWriteStream(saida, { flags: 'wx', mode: 0o600 });
    const gravacao = pipeline(doc, destino, { signal: sinal });
    gravacao.catch(() => {});

    const origem = fs.createReadStream(entrada, { encoding: 'utf8', signal: sinal });
    const origemFechada = new Promise(resolve => origem.once('close', resolve));
    const leitor = createInterface({ input: origem, crlfDelay: Infinity });
    let erroLeitura;
    origem.on('error', erro => {
        erroLeitura = erro;
        leitor.close();
    });
    let tabela;
    let registros = 0;
    let picoRssBytes = 0;
    const amostrar = () => {
        const rss = process.memoryUsage().rss;
        picoRssBytes = Math.max(picoRssBytes, rss);
        if (process.connected) process.send({ tipo: 'memoria', rss }, () => {});
    };
    const monitor = setInterval(amostrar, 150);
    try {
        for await (const texto of leitor) {
            sinal.throwIfAborted();
            if (!tabela) {
                tabela = criarTabela(doc, JSON.parse(texto));
                continue;
            }
            tabela.escrever(JSON.parse(texto), registros++);
            if (destino.destroyed) await gravacao;
            if (destino.writableNeedDrain) await once(destino, 'drain', { signal: sinal });
            if (registros % 64 === 0) {
                amostrar();
                await cederControle();
            }
        }
        sinal.throwIfAborted();
        if (erroLeitura) throw erroLeitura;
        if (!registros) tabela.vazio();
        doc.end();
        await gravacao;
        amostrar();
        return { pid: process.pid, registros, paginas: tabela.paginas, picoRssBytes };
    } finally {
        leitor.close();
        origem.destroy();
        doc.destroy();
        await Promise.all([origemFechada, gravacao.catch(() => {})]);
        clearInterval(monitor);
    }
}

gerar(controle.signal).then(
    metricas => concluir({ tipo: 'concluido', metricas }),
    erro => concluir({ tipo: 'erro', code: erro.code }, 1)
);

async function concluir(mensagem, codigo = 0) {
    process.exitCode = codigo;
    if (process.connected) {
        const enviado = await new Promise(resolve => process.send(mensagem, erro => resolve(!erro)));
        if (enviado && process.connected) {
            process.removeListener('disconnect', interromper);
            process.disconnect();
            return;
        }
    }
    // Se o pai desapareceu, não haverá chamador para liberar estes arquivos.
    await Promise.allSettled([entrada, saida].map(arquivo => fsp.rm(arquivo, { force: true })));
    await fsp.rmdir(path.dirname(saida)).catch(() => {});
    clearTimeout(prazoDesconexao);
}
