
const { prepararDadosRelatorioPdf } = require('../models/relatorioPdfModel');

const TIPOS = ['movimentacoes', 'estoque', 'produtos'];

function erroHttp(res, status, codigo, mensagem) {
    return res.status(status).json({
        sucesso: false,
        codigo,
        mensagem
    });
}

function validarData(data) {
    return /^\d{4}-\d{2}-\d{2}$/.test(data) &&
        !Number.isNaN(Date.parse(`${data}T00:00:00`));
}

function validarFiltros(tipo, query) {
    const filtros = {};

    if (tipo === 'movimentacoes') {
        const { dataInicio, dataFim, id_produto, tipo_movimentacao } = query;

        if (dataInicio !== undefined) {
            if (typeof dataInicio !== 'string' || !validarData(dataInicio)) {
                throw new Error('Data inicial inválida.');
            }
            filtros.dataInicio = dataInicio;
        }

        if (dataFim !== undefined) {
            if (typeof dataFim !== 'string' || !validarData(dataFim)) {
                throw new Error('Data final inválida.');
            }
            filtros.dataFim = dataFim;
        }

        if (filtros.dataInicio && filtros.dataFim &&
            filtros.dataInicio > filtros.dataFim) {
            throw new Error('A data inicial não pode ser posterior à data final.');
        }

        if (id_produto !== undefined) {
            if (!/^\d+$/.test(String(id_produto))) {
                throw new Error('Código do produto inválido.');
            }
            filtros.id_produto = Number(id_produto);
        }

        if (tipo_movimentacao !== undefined) {
            if (!['entrada', 'saida'].includes(tipo_movimentacao)) {
                throw new Error('Tipo de movimentação inválido.');
            }
            filtros.tipo_movimentacao = tipo_movimentacao;
        }
    }

    if (tipo === 'estoque') {
        const { busca, categoria, apenasZerados } = query;

        if (busca !== undefined) {
            if (typeof busca !== 'string') throw new Error('Busca inválida.');
            filtros.busca = busca;
        }

        if (categoria !== undefined) {
            if (typeof categoria !== 'string') throw new Error('Categoria inválida.');
            filtros.categoria = categoria;
        }

        if (apenasZerados !== undefined) {
            if (!['true', 'false'].includes(apenasZerados)) {
                throw new Error('Filtro de estoque zerado inválido.');
            }
            filtros.apenasZerados = apenasZerados === 'true';
        }
    }

    if (tipo === 'produtos' && Object.keys(query).length > 0) {
        throw new Error('O relatório de produtos não aceita filtros.');
    }

    return filtros;
}

function criarRelatorioPdfController({
    consultarHistorico,
    listarRelatorioEstoque,
    consultarRelatorioProdutos,
    gerarRelatorioPdf
}) {
    const dependencias = [
        consultarHistorico,
        listarRelatorioEstoque,
        consultarRelatorioProdutos,
        gerarRelatorioPdf
    ];

    if (dependencias.some(dependencia => typeof dependencia !== 'function')) {
        throw new TypeError('O Controller PDF exige todas as dependências.');
    }

    return async function relatorioPdfController(req, res) {
        const tipo = req.params.tipo;

        if (!TIPOS.includes(tipo)) {
            return erroHttp(res, 400, 'INVALID_REPORT', 'Tipo de relatório inválido.');
        }

        let filtros;

        try {
            filtros = validarFiltros(tipo, req.query);
        } catch (erro) {
            return erroHttp(res, 400, 'INVALID_FILTER', erro.message);
        }

        const controlador = new AbortController();
        let resultado;

        const interromper = () => {
            if (!res.writableFinished && !controlador.signal.aborted) {
                controlador.abort();
            }
        };

        req.once('aborted', interromper);
        res.once('close', interromper);

        res.setHeader('Cache-Control', 'no-store');

        try {
            let registros;

            if (tipo === 'movimentacoes') {
                registros = await consultarHistorico({
                    data_inicio: filtros.dataInicio,
                    data_fim: filtros.dataFim,
                    id_produto: filtros.id_produto,
                    tipo_movimentacao: filtros.tipo_movimentacao
                });
            } else if (tipo === 'estoque') {
    const relatorio = await listarRelatorioEstoque({
        busca: filtros.busca || '',
        categoria: filtros.categoria || '',
        apenasZerados: filtros.apenasZerados === 'true'
    });

    registros = relatorio.itens || [];
} else {
    registros = await consultarRelatorioProdutos();
}

            controlador.signal.throwIfAborted();

            const dados = prepararDadosRelatorioPdf(tipo, registros);

            resultado = await gerarRelatorioPdf(dados, {
                signal: controlador.signal
            });

            controlador.signal.throwIfAborted();

            return res.download(
                resultado.caminhoArquivo,
                `relatorio-${tipo}.pdf`,
                async erro => {
                    try {
                        if (erro && !res.headersSent && !controlador.signal.aborted) {
                            erroHttp(
                                res,
                                500,
                                'PDF_DOWNLOAD_ERROR',
                                'Não foi possível enviar o relatório PDF.'
                            );
                        }
                    } finally {
                        await resultado.limpar().catch(() => {});
                    }
                }
            );
        } catch (erro) {
            if (resultado) {
                await resultado.limpar().catch(() => {});
            }

            if (controlador.signal.aborted || res.destroyed) return;

            if (erro.code === 'EXPORT_BUSY') {
                return erroHttp(res, 409, erro.code, 'Já existe uma exportação em andamento.');
            }

            if (erro.code === 'EXPORT_TIMEOUT') {
                return erroHttp(res, 504, erro.code, 'A geração do PDF excedeu o tempo limite.');
            }

            if (erro.code === 'INVALID_DATA' || erro.code === 'INPUT_LIMIT') {
                return erroHttp(res, 400, erro.code, 'Os dados não permitem gerar o relatório.');
            }

            console.error('Erro ao gerar relatório PDF:', erro);

            return erroHttp(
                res,
                500,
                'PDF_GENERATION_ERROR',
                'Não foi possível gerar o relatório PDF.'
            );
        } finally {
            req.removeListener('aborted', interromper);
            res.removeListener('close', interromper);
        }
    };
}

module.exports = { criarRelatorioPdfController };
