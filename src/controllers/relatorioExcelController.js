const { CABECALHOS, gerarRelatorioExcel: gerarXlsx } = require('../services/relatorioExcelService');

const NOME_ARQUIVO = 'relatorio-movimentacoes.xlsx';
const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const FILTROS_ACEITOS = new Set(['categoria', 'dataInicio', 'dataFim', 'id_produto', 'tipo_movimentacao']);

const CAMPOS_MOVIMENTACAO = [
    'id_movimentacao', 'nome_produto', 'sku_produto', 'tipo_movimentacao',
    'quantidade', 'data_movimentacao', 'nome_responsavel', 'justificativa'
];

function adaptarRegistrosParaExcel(registros) {
    return {
        cabecalhos: CABECALHOS,
        linhas: registros.map(registro => CAMPOS_MOVIMENTACAO.map(campo => registro[campo] ?? '')),
        totalRegistros: registros.length
    };
}

function dataValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number(valor.slice(0, 4)) < 1000) return false;
    const data = new Date(valor + 'T00:00:00.000Z');
    return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

function erroDosFiltros(query) {
    if (Object.entries(query).some(([chave, valor]) => !FILTROS_ACEITOS.has(chave) || typeof valor !== 'string')) {
        return 'Informe apenas filtros de exportação válidos, sem repetir parâmetros.';
    }
    const { categoria, dataInicio, dataFim } = query;
    if (categoria) return 'A exportação de movimentações não aceita filtro por categoria.';
    if ([dataInicio, dataFim].some(data => data && !dataValida(data))) {
        return 'Informe datas válidas no formato AAAA-MM-DD.';
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
        return 'A data inicial não pode ser posterior à data final.';
    }
}

function responderErro(res, status, mensagem) {
    return res.status(status).json({ sucesso: false, mensagem });
}

function criarRelatorioExcelController({
    consultarHistorico,
    prepararDadosRelatorioExcel = adaptarRegistrosParaExcel,
    gerarRelatorioExcel = gerarXlsx
}) {
    return async function exportarExcel(req, res) {
        const query = req.query || {};
        const erroFiltro = erroDosFiltros(query);
        if (res.destroyed) return;
        if (erroFiltro) return responderErro(res, 400, erroFiltro);

        res.set('Cache-Control', 'no-store');

        let arquivo;
        let etapa = 'consulta';
        try {
            const registros = await consultarHistorico({
                data_inicio: query.dataInicio,
                data_fim: query.dataFim,
                id_produto: query.id_produto,
                tipo_movimentacao: query.tipo_movimentacao
            });
            if (res.destroyed) return;

            etapa = 'preparação';
            const dados = await prepararDadosRelatorioExcel(registros);
            if (res.destroyed) return;

            etapa = 'geração';
            arquivo = await gerarRelatorioExcel(dados);
            if (res.destroyed) return;

            etapa = 'envio';
            await new Promise((resolve, reject) => {
                res.download(arquivo.caminhoArquivo, NOME_ARQUIVO, {
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
                return responderErro(res, 400, 'Os filtros do histórico são inválidos.');
            }
            if (etapa === 'geração' && erro.code === 'EXPORT_BUSY') {
                return responderErro(res, 409, 'Já existe uma exportação em andamento. Tente novamente.');
            }
            if (etapa === 'geração' && erro.code === 'EXPORT_TIMEOUT') {
                return responderErro(res, 504, 'A geração do Excel excedeu o tempo limite. Tente novamente.');
            }

            console.error('Falha na exportação Excel. Etapa:', etapa);
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
