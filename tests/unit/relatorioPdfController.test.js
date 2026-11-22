jest.mock('../../src/models/produtoModel', () => ({
    listarRelatorioEstoque: jest.fn()
}));

const ProdutoModel = require('../../src/models/produtoModel');

const {
    exportarRelatorioEstoquePdf
} = require('../../src/controllers/relatorioPdfController');

function criarResposta() {
    return {
        statusCode: 200,
        headers: {},
        arquivo: null,
        dadosJson: null,

        set: jest.fn(function (headers) {
            this.headers = headers;
            return this;
        }),

        status: jest.fn(function (codigo) {
            this.statusCode = codigo;
            return this;
        }),

        send: jest.fn(function (arquivo) {
            this.arquivo = arquivo;
            return this;
        }),

        json: jest.fn(function (dados) {
            this.dadosJson = dados;
            return this;
        })
    };
}

function criarRelatorio(quantidade = 2) {
    const itens = Array.from({ length: quantidade }, (_, indice) => ({
        sku: `SKU-${String(indice + 1).padStart(4, '0')}`,
        nome: indice === 0 ? 'Fonte de alimentação' : `Produto de teste ${indice + 1}`,
        categoria: 'Componentes',
        quantidadeEstoque: indice % 5,
        valorUnitario: 10.5,
        valorEstoque: (indice % 5) * 10.5
    }));

    return {
        geradoEm: '2026-11-22T12:00:00.000Z',
        resumo: {
            totalItens: quantidade,
            totalUnidades: itens.reduce((total, item) => total + item.quantidadeEstoque, 0),
            produtosZerados: itens.filter((item) => item.quantidadeEstoque === 0).length,
            valorTotalEstoque: Number(
                itens.reduce((total, item) => total + item.valorEstoque, 0).toFixed(2)
            )
        },
        itens
    };
}

function abrirPdf(buffer) {
    expect(Buffer.isBuffer(buffer)).toBe(true);

    const pdf = buffer.toString('latin1');

    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf.endsWith('%%EOF')).toBe(true);

    const inicioXref = Number(pdf.match(/startxref\n(\d+)\n%%EOF$/)[1]);

    expect(pdf.slice(inicioXref, inicioXref + 4)).toBe('xref');

    const tabelaXref = pdf.slice(inicioXref).match(/xref\n0 (\d+)\n([\s\S]*?)trailer/);

    expect(tabelaXref).not.toBeNull();

    const quantidadeObjetos = Number(tabelaXref[1]);
    const entradas = tabelaXref[2].trimEnd().split('\n').slice(1);

    for (let id = 1; id < quantidadeObjetos; id += 1) {
        const offset = Number(entradas[id - 1].slice(0, 10));

        expect(
            pdf.slice(offset, offset + `${id} 0 obj`.length)
        ).toBe(`${id} 0 obj`);
    }

    const paginas = [...pdf.matchAll(
        /(\d+) 0 obj\n<< \/Type \/Page \/Parent 2 0 R[\s\S]*?\nendobj/g
    )];

    const textosPaginas = paginas.map((pagina) => {
        const idPagina = Number(pagina[1]);

        const objetoPagina = pdf.match(
            new RegExp(`${idPagina} 0 obj\\n([\\s\\S]*?)\\nendobj`)
        );

        const conteudoId = Number(
            objetoPagina[1].match(/\/Contents (\d+) 0 R/)[1]
        );

        const objetoConteudo = pdf.match(
            new RegExp(
                `${conteudoId} 0 obj\\n<< \\/Length \\d+ >>\\nstream\\n([\\s\\S]*?)\\nendstream\\nendobj`
            )
        );

        expect(objetoConteudo).not.toBeNull();

        const conteudo = objetoConteudo[1];

        const linhas = [...conteudo.matchAll(/<([0-9A-F]*)> Tj/g)]
            .map((match) => Buffer.from(match[1], 'hex').toString('latin1'));

        return {
            pagina: pagina[0],
            conteudo,
            linhas
        };
    });

    return { pdf, paginas: textosPaginas };
}

describe('CI — Exportação de relatório de estoque em PDF', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        ProdutoModel.listarRelatorioEstoque.mockResolvedValue(
            criarRelatorio()
        );
    });

    test('gera, abre e retorna um PDF válido para download', async () => {
        const req = {
            usuario: { id_usuario: 1, id_nivel_acesso: 1 },
            query: {}
        };

        const res = criarResposta();

        await exportarRelatorioEstoquePdf(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.headers['Content-Type']).toBe('application/pdf');

        expect(res.headers['Content-Disposition']).toMatch(
            /^attachment; filename="relatorio_estoque_.*\.pdf"$/
        );

        expect(res.headers['Content-Length']).toBe(res.arquivo.length);

        const documento = abrirPdf(res.arquivo);

        expect(documento.paginas).toHaveLength(1);
    });

    test('confere cabeçalho, resumo e dados dos produtos', async () => {
        const res = criarResposta();

        await exportarRelatorioEstoquePdf({
            usuario: { id_nivel_acesso: 1 },
            query: {}
        }, res);

        const { paginas } = abrirPdf(res.arquivo);

        const texto = paginas
            .flatMap((pagina) => pagina.linhas)
            .join('\n');

        expect(texto).toContain('STOCKMASTER - RELATORIO DE ESTOQUE');
        expect(texto).toContain('Produtos: 2');
        expect(texto).toContain('SKU-0001');
        expect(texto).toContain('Fonte de alimentação');
        expect(texto).toContain('Componentes');
        expect(texto).toContain('SKU-0002');
        expect(texto).toContain('Pagina 1 de 1');
    });

    test('mantém cabeçalho, numeração e layout em todas as páginas', async () => {
        ProdutoModel.listarRelatorioEstoque.mockResolvedValue(
            criarRelatorio(60)
        );

        const res = criarResposta();

        await exportarRelatorioEstoquePdf({
            usuario: { id_nivel_acesso: 1 },
            query: {}
        }, res);

        const { paginas } = abrirPdf(res.arquivo);

        expect(paginas).toHaveLength(3);

        paginas.forEach((pagina, indice) => {
            expect(pagina.linhas[0]).toBe(
                'STOCKMASTER - RELATORIO DE ESTOQUE'
            );

            expect(pagina.linhas).toContain(
                `Pagina ${indice + 1} de 3`
            );

            expect(pagina.pagina).toContain(
                '/MediaBox [0 0 842 595]'
            );

            expect(pagina.conteudo).toContain('/F1 9 Tf');
            expect(pagina.conteudo).toContain('40 555 Td');

            expect(pagina.linhas.length).toBeLessThanOrEqual(35);
        });
    });

    test('testa grande volume de dados sem perder produtos ou paginação', async () => {
        const quantidade = 1000;

        ProdutoModel.listarRelatorioEstoque.mockResolvedValue(
            criarRelatorio(quantidade)
        );

        const res = criarResposta();

        await exportarRelatorioEstoquePdf({
            usuario: { id_nivel_acesso: 1 },
            query: {}
        }, res);

        const { paginas } = abrirPdf(res.arquivo);

        expect(paginas).toHaveLength(
            Math.ceil(quantidade / 27)
        );

        const texto = paginas
            .flatMap((pagina) => pagina.linhas)
            .join('\n');

        expect(texto).toContain('SKU-0001');
        expect(texto).toContain('SKU-1000');
        expect(texto).toContain(`Produtos: ${quantidade}`);

        for (let indice = 1; indice <= paginas.length; indice += 1) {
            expect(texto).toContain(
                `Pagina ${indice} de ${paginas.length}`
            );
        }
    });

    test('gera PDF válido quando não existem produtos', async () => {
        ProdutoModel.listarRelatorioEstoque.mockResolvedValue(
            criarRelatorio(0)
        );

        const res = criarResposta();

        await exportarRelatorioEstoquePdf({
            usuario: { id_nivel_acesso: 1 },
            query: {}
        }, res);

        const { paginas } = abrirPdf(res.arquivo);

        expect(paginas).toHaveLength(1);

        expect(paginas[0].linhas).toContain(
            'Nenhum produto encontrado para os filtros informados.'
        );
    });

    test('encaminha filtros para o Model', async () => {
        const res = criarResposta();

        await exportarRelatorioEstoquePdf({
            usuario: { id_nivel_acesso: 1 },
            query: {
                busca: ' Fonte ',
                categoria: ' Componentes ',
                apenasZerados: 'true'
            }
        }, res);

        expect(
            ProdutoModel.listarRelatorioEstoque
        ).toHaveBeenCalledWith({
            busca: 'Fonte',
            categoria: 'Componentes',
            apenasZerados: true
        });
    });

    test('bloqueia usuário sem perfil de administrador', async () => {
        const res = criarResposta();

        await exportarRelatorioEstoquePdf({
            usuario: { id_nivel_acesso: 2 },
            query: {}
        }, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ sucesso: false })
        );

        expect(
            ProdutoModel.listarRelatorioEstoque
        ).not.toHaveBeenCalled();
    });

    test('retorna erro controlado quando o Model falha', async () => {
        ProdutoModel.listarRelatorioEstoque.mockRejectedValue(
            new Error('Falha simulada')
        );

        const logOriginal = console.error;
        console.error = jest.fn();

        try {
            const res = criarResposta();

            await exportarRelatorioEstoquePdf({
                usuario: { id_nivel_acesso: 1 },
                query: {}
            }, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                sucesso: false,
                mensagem: 'Não foi possível exportar o relatório em PDF.'
            });
        } finally {
            console.error = logOriginal;
        }
    });
});
