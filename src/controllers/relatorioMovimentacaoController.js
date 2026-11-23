
"use strict";

const relatorioMovimentacaoModel =
    require('../models/relatorioMovimentacaoModel');

function dataValida(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) {
        return false;
    }

    const dataConvertida = new Date(`${data}T00:00:00.000Z`);

    return !Number.isNaN(dataConvertida.getTime()) &&
        dataConvertida.toISOString().slice(0, 10) === data;
}

async function gerarRelatorioMovimentacoes(req, res) {
    try {
        const {
            dataInicio,
            dataFim,
            tipoMovimentacao,
            idUsuario
        } = req.query;

        if (!dataInicio || !dataFim) {
            return res.status(400).json({
                success: false,
                message: 'As datas de início e fim são obrigatórias.'
            });
        }

        if (!dataValida(dataInicio) || !dataValida(dataFim)) {
            return res.status(400).json({
                success: false,
                message: 'Informe datas válidas no formato AAAA-MM-DD.'
            });
        }

        if (dataInicio > dataFim) {
            return res.status(400).json({
                success: false,
                message: 'A data inicial não pode ser posterior à data final.'
            });
        }

        let usuarioFiltro = null;

        if (idUsuario !== undefined && idUsuario !== '') {
            usuarioFiltro = Number(idUsuario);

            if (!Number.isInteger(usuarioFiltro) || usuarioFiltro <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuário inválido.'
                });
            }
        }

        const filtros = {
            dataInicio,
            dataFim,
            tipoMovimentacao: tipoMovimentacao || null,
            idUsuario: usuarioFiltro
        };

        const registros =
            await relatorioMovimentacaoModel
                .consultarMovimentacoesParaRelatorio(filtros);

        if (registros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhuma movimentação encontrada para os filtros informados.',
                data: {
                    periodo: {
                        data_inicio: dataInicio,
                        data_fim: dataFim
                    },
                    total_registros: 0,
                    registros: []
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Relatório de movimentações gerado com sucesso.',
            data: {
                data_inicio: dataInicio,
                data_fim: dataFim,
                data_geracao: new Date().toISOString(),
                filtros_aplicados: filtros,
                total_registros: registros.length,
                registros
            }
        });

    } catch (erro) {
        console.error('Erro ao gerar relatório de movimentações:', erro);

        return res.status(500).json({
            success: false,
            message: 'Erro interno ao consultar o relatório de movimentações.'
        });
    }
}

module.exports = {
    gerarRelatorioMovimentacoes
};