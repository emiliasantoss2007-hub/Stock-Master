
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const { createInterface } = require('node:readline');
const PDFDocument = require('pdfkit');
const fontkit = require('fontkit');

const FONTE = require.resolve(
    '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff'
);

const FONTE_NEGRITO = require.resolve(
    '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff'
);

const RELATORIOS = Object.freeze({
    movimentacoes: {
        titulo: 'Relatório de movimentações de estoque',
        vazio: 'Nenhuma movimentação encontrada.',
        orientacao: 'landscape',
        larguras: [48, 105, 65, 100, 65, 90, 100, 150],
        camposData: ['Data'],
        alinhamentoDireita: ['Quantidade']
    },
    estoque: {
        titulo: 'Relatório de estoque atual',
        vazio: 'Nenhum produto encontrado no estoque.',
        orientacao: 'landscape',
        larguras: [55, 85, 130, 100, 105, 90, 110],
        camposData: [],
        alinhamentoDireita: [
            'Quantidade em estoque',
            'Valor unitário',
            'Valor total em estoque'
        ]
    },
    produtos: {
        titulo: 'Relatório de produtos cadastrados',
        vazio: 'Nenhum produto cadastrado encontrado.',
        orientacao: 'landscape',
        larguras: [150, 100, 120, 110, 105],
        camposData: [],
        alinhamentoDireita: ['Quantidade em estoque']
    }
});

const MARGEM = 32;
const ALTURA_LINHA_MINIMA = 28;
const TAMANHO_FONTE = 8;
const TAMANHO_TITULO = 16;

function formatarCelula(valor, titulo) {
    if (valor == null || valor === '') return '-';

    if (valor instanceof Date) {
        return valor.toLocaleString('pt-BR');
    }

    if (
        titulo === 'Data' &&
        typeof valor === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(valor)
    ) {
        const data = new Date(valor);

        if (Number.isFinite(data.getTime())) {
            return data.toLocaleString('pt-BR');
        }
    }

    if (
        ['Valor unitário', 'Valor total em estoque'].includes(titulo) &&
        Number.isFinite(Number(valor))
    ) {
        return Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    return String(valor);
}

function calcularAlturaLinha(doc, valores, larguras) {
    const alturas = valores.map((valor, indice) =>
        doc.heightOfString(valor, {
            width: larguras[indice] - 10,
            align: 'left',
            lineGap: 2
        })
    );

    return Math.max(ALTURA_LINHA_MINIMA, Math.max(...alturas) + 14);
}

function desenharCabecalho(doc, titulos, larguras, configuracao, pagina) {
    const larguraTotal = larguras.reduce((total, largura) => total + largura, 0);

    doc.font('NotoSansBold')
        .fontSize(TAMANHO_TITULO)
        .fillColor('#1F4E79')
        .text(configuracao.titulo, MARGEM, MARGEM, {
            width: larguraTotal,
            align: 'center'
        });

    const y = MARGEM + 42;

    doc.font('NotoSans')
        .fontSize(8)
        .fillColor('#555555')
        .text(`Página ${pagina}`, MARGEM, y - 16, {
            width: larguraTotal,
            align: 'right'
        });

    doc.font('NotoSansBold')
        .fontSize(TAMANHO_FONTE)
        .fillColor('#FFFFFF');

    let x = MARGEM;

    titulos.forEach((titulo, indice) => {
        doc.rect(x, y, larguras[indice], 30).fill('#1F4E79');

        doc.fillColor('#FFFFFF').text(titulo, x + 5, y + 5, {
            width: larguras[indice] - 10,
            height: 22,
            align: 'left',
            valign: 'center'
        });

        x += larguras[indice];
    });

    return y + 30;
}

function desenharLinha(doc, valores, larguras, y, configuracao, titulos) {
    const altura = calcularAlturaLinha(doc, valores, larguras);
    const larguraTotal = larguras.reduce((total, largura) => total + largura, 0);

    doc.rect(MARGEM, y, larguraTotal, altura)
        .fill('#FFFFFF');

    let x = MARGEM;

    valores.forEach((valor, indice) => {
        const titulo = titulos[indice];

        doc.rect(x, y, larguras[indice], altura)
            .lineWidth(0.5)
            .strokeColor('#D0D7DE')
            .stroke();

        doc.font('NotoSans')
            .fontSize(TAMANHO_FONTE)
            .fillColor('#222222')
            .text(valor, x + 5, y + 7, {
                width: larguras[indice] - 10,
                align: configuracao.alinhamentoDireita.includes(titulo)
                    ? 'right'
                    : 'left',
                lineGap: 2
            });

        x += larguras[indice];
    });

    return y + altura;
}
async function gerarPdf(entrada, saida, tipo) {
    const configuracao = RELATORIOS[tipo];

    if (!configuracao) {
        throw new Error('Tipo de relatório não reconhecido.');
    }

    fontkit.create(fs.readFileSync(FONTE));
    fontkit.create(fs.readFileSync(FONTE_NEGRITO));

    const leitura = createInterface({
        input: fs.createReadStream(entrada),
        crlfDelay: Infinity
    });

    const documento = new PDFDocument({
        size: 'A4',
        layout: configuracao.orientacao,
        margins: {
            top: MARGEM,
            bottom: MARGEM,
            left: MARGEM,
            right: MARGEM
        },
        bufferPages: false,
        autoFirstPage: true
    });

    documento.registerFont('NotoSans', FONTE);
    documento.registerFont('NotoSansBold', FONTE_NEGRITO);

    const arquivo = fs.createWriteStream(saida, {
        flags: 'wx',
        mode: 0o600
    });

    documento.pipe(arquivo);

    let titulos;
    let larguras;
    let y;
    let pagina = 1;
    let totalRegistros = 0;

    const larguraDisponivel =
        documento.page.width - MARGEM * 2;

    try {
        for await (const linha of leitura) {
            const dados = JSON.parse(linha);

            if (!titulos) {
                if (
                    dados.tipo !== tipo ||
                    !Array.isArray(dados.titulos) ||
                    dados.titulos.length === 0 ||
                    dados.titulos.length > 8
                ) {
                    throw new Error('Cabeçalho do relatório inválido.');
                }

                titulos = dados.titulos;

                const largurasBase = configuracao.larguras;

                if (largurasBase.length !== titulos.length) {
                    throw new Error('Quantidade de colunas incompatível.');
                }

                const soma = largurasBase.reduce(
                    (total, largura) => total + largura,
                    0
                );

                const escala = larguraDisponivel / soma;

                larguras = largurasBase.map(largura => largura * escala);

                y = desenharCabecalho(
                    documento,
                    titulos,
                    larguras,
                    configuracao,
                    pagina
                );

                continue;
            }

            if (!Array.isArray(dados) || dados.length !== titulos.length) {
                throw new Error('Linha do relatório inválida.');
            }

            const valores = dados.map((valor, indice) =>
                formatarCelula(valor, titulos[indice])
            );

            const altura = calcularAlturaLinha(documento, valores, larguras);

            if (y + altura > documento.page.height - MARGEM) {
                documento.addPage();
                pagina++;

                y = desenharCabecalho(
                    documento,
                    titulos,
                    larguras,
                    configuracao,
                    pagina
                );
            }

           y = desenharLinha(
               documento,
               valores,
               larguras,
               y,
               configuracao,
               titulos
);

            totalRegistros++;
        }

        if (!titulos) {
            throw new Error('O relatório não possui cabeçalho.');
        }

        if (totalRegistros === 0) {
            documento.font('NotoSans')
                .fontSize(10)
                .fillColor('#555555')
                .text(configuracao.vazio, MARGEM, y + 20, {
                    width: larguraDisponivel,
                    align: 'center'
                });
        }

        documento.end();

        await new Promise((resolve, reject) => {
            arquivo.once('finish', resolve);
            arquivo.once('error', reject);
            documento.once('error', reject);
        });

        if (process.send) {
            process.send({
                tipo: 'concluido',
                metricas: {
                    registros: totalRegistros,
                    paginas: pagina
                }
            });
        }
    } catch (erro) {
        leitura.close();
        documento.destroy();
        arquivo.destroy();
        await fsp.rm(saida, { force: true }).catch(() => {});
        throw erro;
    }
}

async function main() {
    const [entrada, saida, tipo] = process.argv.slice(2);

    if (!entrada || !saida || !tipo) {
        throw new Error('Argumentos do Worker incompletos.');
    }

    await gerarPdf(entrada, saida, tipo);
}

main().catch(erro => {
    if (process.send) {
        process.send({
            tipo: 'erro',
            code: 'PDF_GENERATION_ERROR',
            message: erro.message
        });
    }

    process.exitCode = 1;
});
