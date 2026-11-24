// Model responsável pela consulta do histórico de movimentações
const movimentacaoModel = require('../models/movimentacaoModel');

// Controller responsável pela consulta do histórico
const consultarHistorico = async (req, res) => {

    try {

        // Recebe os filtros enviados pela URL
        const filtros = {
            id_produto: req.query.id_produto,
            data_inicio: req.query.data_inicio,
            data_fim: req.query.data_fim,
            tipo_movimentacao: req.query.tipo_movimentacao
        };

        // Solicita ao Model a consulta do histórico
        const resultados = await movimentacaoModel.consultarHistorico(filtros);

        // Retorna os resultados da consulta
        return res.status(200).json(resultados);

    } catch (erro) {

        // Verifica se o erro foi causado por um filtro inválido
        if (erro.code === 'INVALID_FILTER') {
            return res.status(400).json({
                message: erro.message
            });
        }

        // Registra o erro para facilitar a identificação do problema
        console.error('Erro ao consultar histórico de movimentações:', erro);

        // Retorna uma resposta de erro interno
        return res.status(500).json({
            message: 'Erro interno ao consultar histórico de movimentações.'
        });
    }
};

// Exporta o Controller para utilização pelas rotas
const CAMPOS_PREVIA = [
    'id_movimentacao', 'nome_produto', 'sku_produto', 'tipo_movimentacao',
    'quantidade', 'data_movimentacao', 'nome_responsavel', 'justificativa'
];

async function consultarPreviaMovimentacoes(req, res) {
    res.set('Cache-Control', 'no-store');
    if (Object.entries(req.query).some(([chave, valor]) =>
        !['dataInicio', 'dataFim'].includes(chave) || typeof valor !== 'string')) {
        return res.status(400).json({ message: 'Informe apenas dataInicio e dataFim, sem repetir parâmetros.' });
    }
    try {
        const registros = await movimentacaoModel.consultarHistorico({
            data_inicio: req.query.dataInicio,
            data_fim: req.query.dataFim
        });
        return res.json({
            registros: registros.map(item => Object.fromEntries(
                CAMPOS_PREVIA.map(campo => [campo, item[campo] ?? null])
            ))
        });
    } catch (erro) {
        if (erro.code === 'INVALID_FILTER') {
            return res.status(400).json({ message: 'Informe um período válido no formato AAAA-MM-DD.' });
        }
        return res.status(500).json({ message: 'Não foi possível consultar as movimentações.' });
    }
}

module.exports = {
    consultarHistorico,
    consultarPreviaMovimentacoes
};
