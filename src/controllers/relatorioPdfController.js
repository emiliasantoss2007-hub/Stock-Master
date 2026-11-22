const ProdutoModel = require('../models/produtoModel');

const LINHAS_POR_PAGINA = 35;
const LINHAS_CABECALHO = 8;
const LINHAS_DADOS_POR_PAGINA = LINHAS_POR_PAGINA - LINHAS_CABECALHO;

function textoPdf(valor) {
    const texto = String(valor ?? '-').replace(/[\r\n]+/g, ' ');
    return Buffer.from(texto, 'latin1').toString('hex').toUpperCase();
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function criarCabecalho(relatorio, paginaAtual, totalPaginas) {
    return [
        'STOCKMASTER - RELATORIO DE ESTOQUE',
        `Gerado em: ${new Date(relatorio.geradoEm).toLocaleString('pt-BR')}`,
        `Produtos: ${relatorio.resumo.totalItens} | Unidades: ${relatorio.resumo.totalUnidades}`,
        `Produtos zerados: ${relatorio.resumo.produtosZerados} | Valor em estoque: ${formatarMoeda(relatorio.resumo.valorTotalEstoque)}`,
        `Pagina ${paginaAtual} de ${totalPaginas}`,
        '',
        'SKU | PRODUTO | CATEGORIA | QTD. | VALOR UNIT. | VALOR ESTOQUE',
        '--------------------------------------------------------------------------------'
    ];
}

function gerarDocumentoPdf(relatorio) {
    const linhasDados = relatorio.itens.length === 0
        ? ['Nenhum produto encontrado para os filtros informados.']
        : relatorio.itens.map((item) => [
            item.sku,
            item.nome,
            item.categoria,
            item.quantidadeEstoque,
            item.valorUnitario == null ? '-' : formatarMoeda(item.valorUnitario),
            formatarMoeda(item.valorEstoque)
        ].join(' | '));

    const blocosDados = [];

    for (let i = 0; i < linhasDados.length; i += LINHAS_DADOS_POR_PAGINA) {
        blocosDados.push(linhasDados.slice(i, i + LINHAS_DADOS_POR_PAGINA));
    }

    const totalPaginas = Math.max(1, blocosDados.length);

    const paginas = blocosDados.map((bloco, indice) => [
        ...criarCabecalho(relatorio, indice + 1, totalPaginas),
        ...bloco
    ]);

    const objetos = [];
    const paginasIds = paginas.map((_, indice) => 4 + indice * 2);

    objetos[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objetos[2] = `<< /Type /Pages /Kids [${paginasIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`;
    objetos[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>';

    paginas.forEach((pagina, indice) => {
        const paginaId = 4 + indice * 2;
        const conteudoId = paginaId + 1;

        let conteudo = 'BT\n/F1 9 Tf\n40 555 Td\n';

        pagina.forEach((linha, linhaIndice) => {
            if (linhaIndice > 0) conteudo += '0 -14 Td\n';
            conteudo += `<${textoPdf(linha.slice(0, 125))}> Tj\n`;
        });

        conteudo += 'ET';

        objetos[paginaId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 3 0 R >> >> /Contents ${conteudoId} 0 R >>`;

        objetos[conteudoId] = `<< /Length ${Buffer.byteLength(conteudo, 'latin1')} >>\nstream\n${conteudo}\nendstream`;
    });

    let documento = '%PDF-1.4\n';
    const offsets = [0];

    for (let id = 1; id < objetos.length; id += 1) {
        offsets[id] = Buffer.byteLength(documento, 'latin1');
        documento += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
    }

    const inicioXref = Buffer.byteLength(documento, 'latin1');

    documento += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;

    for (let id = 1; id < objetos.length; id += 1) {
        documento += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    }

    documento += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;

    return Buffer.from(documento, 'latin1');
}

async function exportarRelatorioEstoquePdf(req, res) {
    try {
        const usuario = req.usuario;

        if (!usuario || Number(usuario.id_nivel_acesso ?? usuario.perfil?.id) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem exportar relatórios.'
            });
        }

        const { busca, categoria, apenasZerados } = req.query;

        const filtros = {
            busca: typeof busca === 'string' ? busca.trim() : '',
            categoria: typeof categoria === 'string' ? categoria.trim() : '',
            apenasZerados: apenasZerados === 'true' || apenasZerados === '1'
        };

        const relatorio = await ProdutoModel.listarRelatorioEstoque(filtros);
        const arquivo = gerarDocumentoPdf(relatorio);

        const dataArquivo = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());

        const nomeArquivo = `relatorio_estoque_${dataArquivo}.pdf`;

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
            'Content-Length': arquivo.length,
            'Cache-Control': 'no-store'
        });

        return res.status(200).send(arquivo);

    } catch (erro) {
        console.error('Erro ao exportar relatório de estoque em PDF:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Não foi possível exportar o relatório em PDF.'
        });
    }
}

module.exports = { 
    exportarRelatorioEstoquePdf,
    gerarDocumentoPdf
};