
const { CABECALHOS, gerarRelatorioExcel: gerarXlsx } = require('../services/relatorioExcelService');

const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const CAMPOS_MOVIMENTACAO = [
    'id_movimentacao', 'nome_produto', 'sku_produto', 'tipo_movimentacao',
    'quantidade', 'data_movimentacao', 'nome_responsavel', 'justificativa'
];

const RELATORIOS = {
    movimentacoes: {
        arquivo: 'relatorio-movimentacoes.xlsx',
        cabecalhos: CABECALHOS,
        nomeAba: 'Movimentações',
        larguras: [12, 32, 22, 24, 14, 23, 28, 55],
        colunasData: [5],
        colunasInteiras: [0, 4],
        colunasMoeda: []
    },
    estoque: {
        arquivo: 'relatorio-estoque.xlsx',
        cabecalhos: [
            'Código', 'SKU', 'Produto', 'Categoria',
            'Quantidade em estoque', 'Valor unitário', 'Valor total em estoque'
        ],
        nomeAba: 'Estoque atual',
        larguras: [12, 20, 32, 22, 22, 18, 24],
        colunasData: [],
        colunasInteiras: [0, 4],
        colunasMoeda: [5, 6]
    },
    produtos: {
        arquivo: 'relatorio-produtos.xlsx',
        cabecalhos: [
            'Produto', 'SKU', 'Código de barras',
            'Categoria', 'Quantidade em estoque'
        ],
        nomeAba: 'Produtos cadastrados',
        larguras: [32, 20, 22, 22, 22],
        colunasData: [],
        colunasInteiras: [4],
        colunasMoeda: []
    }
};

function dataValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number(valor.slice(0, 4)) < 1000) {
        return false;
    }

    const data = new Date(valor + 'T00:00:00.000Z');
    return Number.isFinite(data.getTime()) &&
        data.toISOString().slice(0, 10) === valor;
}

function validarFiltros(tipo, query) {
    const aceitos = {
        movimentacoes: new Set(['dataInicio', 'dataFim', 'id_produto', 'tipo_movimentacao']),
        estoque: new Set(['busca', 'categoria', 'apenasZerados']),
        produtos: new Set()
    };

    if (!aceitos[tipo]) return 'Tipo de relatório inválido.';

    const filtroInvalido = Object.entries(query).find(([chave, valor]) =>
    !aceitos[tipo].has(chave) || typeof valor !== 'string'
);

if (filtroInvalido) {
    return `Filtro inválido para o relatório: ${filtroInvalido[0]}.`;
}

    if (tipo === 'movimentacoes') {
        const { dataInicio, dataFim } = query;

        if ([dataInicio, dataFim].some(data => data && !dataValida(data))) {
            return 'Informe datas válidas no formato AAAA-MM-DD.';
        }

        if (dataInicio && dataFim && dataInicio > dataFim) {
            return 'A data inicial não pode ser posterior à data final.';
        }
    }

    if (tipo === 'estoque' &&
        query.apenasZerados &&
        !['true', 'false'].includes(query.apenasZerados)) {
        return 'O filtro de produtos zerados é inválido.';
    }
}

function adaptarMovimentacoes(registros) {
    return {
        cabecalhos: RELATORIOS.movimentacoes.cabecalhos,
        linhas: registros.map(registro =>
            CAMPOS_MOVIMENTACAO.map(campo => registro[campo] ?? '')
        ),
        totalRegistros: registros.length
    };
}

function adaptarEstoque(relatorio) {
    const itens = relatorio.itens || [];

    return {
        cabecalhos: RELATORIOS.estoque.cabecalhos,
        linhas: itens.map(item => [
            Number(item.idProduto),
            item.sku ?? '',
            item.nome ?? '',
            item.categoria ?? '',
            Number(item.quantidadeEstoque),
            Number(item.valorUnitario),
            Number(item.valorEstoque)
        ]),
        totalRegistros: itens.length
    };
}

function adaptarProdutos(registros) {
    return {
        cabecalhos: RELATORIOS.produtos.cabecalhos,
        linhas: registros.map(item => [
            item.nome ?? '',
            item.sku ?? '',
            item.codigo_barras ?? '',
            item.categoria ?? '',
            Number(item.quantidade_estoque)
        ]),
        totalRegistros: registros.length
    };
}

function responderErro(res, status, mensagem) {
    return res.status(status).json({ sucesso: false, mensagem });
}

function criarRelatorioExcelController({
    consultarHistorico,
    listarRelatorioEstoque,
    consultarRelatorioProdutos,
    gerarRelatorioExcel = gerarXlsx
}) {
    return async function exportarExcel(req, res) {
        const tipo = req.params.tipo;
        const query = req.query || {};
        const configuracao = RELATORIOS[tipo];

        if (res.destroyed) return;

        if (!configuracao) {
            return responderErro(res, 404, 'Tipo de relatório não encontrado.');
        }

        const erroFiltro = validarFiltros(tipo, query);
        if (erroFiltro) {
            return responderErro(res, 400, erroFiltro);
        }

        res.set('Cache-Control', 'no-store');

        let arquivo;
        let etapa = 'consulta';

        try {
            let registros;

            if (tipo === 'movimentacoes') {
                registros = await consultarHistorico({
                    data_inicio: query.dataInicio,
                    data_fim: query.dataFim,
                    id_produto: query.id_produto,
                    tipo_movimentacao: query.tipo_movimentacao
                });
            } else if (tipo === 'estoque') {
                registros = await listarRelatorioEstoque({
                    busca: query.busca || '',
                    categoria: query.categoria || '',
                    apenasZerados: query.apenasZerados === 'true'
                });
            } else {
                registros = await consultarRelatorioProdutos();
            }

            if (res.destroyed) return;

            etapa = 'preparação';

            let dados;

            if (tipo === 'movimentacoes') {
                dados = adaptarMovimentacoes(registros);
            } else if (tipo === 'estoque') {
                dados = adaptarEstoque(registros);
            } else {
                dados = adaptarProdutos(registros);
            }

            if (res.destroyed) return;

            etapa = 'geração';

            arquivo = await gerarRelatorioExcel(dados, {
                cabecalhos: configuracao.cabecalhos,
                nomeAba: configuracao.nomeAba,
                larguras: configuracao.larguras,
                colunasData: configuracao.colunasData,
                colunasInteiras: configuracao.colunasInteiras,
                colunasMoeda: configuracao.colunasMoeda
            });

            if (res.destroyed) return;

            etapa = 'envio';

            await new Promise((resolve, reject) => {
                res.download(arquivo.caminhoArquivo, configuracao.arquivo, {
                    headers: { 'Content-Type': MIME_XLSX }
                }, erro => erro ? reject(erro) : resolve());
            });
        } catch (erro) {
            if (res.destroyed || res.writableEnded) return;

            if (res.headersSent) {
                res.destroy();
                return;
            }

            if (etapa === 'consulta' && erro.code === 'INVALID_FILTER') {
                return responderErro(res, 400, 'Os filtros do relatório são inválidos.');
            }

            if (etapa === 'geração' && erro.code === 'EXPORT_BUSY') {
                return responderErro(res, 409, 'Já existe uma exportação em andamento. Tente novamente.');
            }

            if (etapa === 'geração' && erro.code === 'EXPORT_TIMEOUT') {
                return responderErro(res, 504, 'A geração do Excel excedeu o tempo limite. Tente novamente.');
            }

            console.error('Falha na exportação Excel. Etapa:', etapa, erro);
            return responderErro(res, 500, 'Não foi possível exportar o arquivo Excel. Tente novamente.');
        } finally {
            if (arquivo) {
                try {
                    await arquivo.limpar();
                } catch {
                    console.error('Falha ao limpar os arquivos temporários da exportação Excel.');
                }
            }
        }
    };
}

module.exports = { criarRelatorioExcelController };
