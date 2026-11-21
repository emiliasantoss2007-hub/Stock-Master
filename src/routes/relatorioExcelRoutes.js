const { Router } = require('express');
const { criarRelatorioExcelController } = require('../controllers/relatorioExcelController');

function criarRelatorioExcelRoutes({ autenticar, autorizar, consultarHistorico }) {
    if ([autenticar, autorizar, consultarHistorico].some(dependencia => typeof dependencia !== 'function')) {
        throw new TypeError('A rota Excel exige autenticação, autorização e consulta de histórico.');
    }

    const router = Router();
    router.get('/api/relatorio/movimentacoes/excel', autenticar, autorizar,
        criarRelatorioExcelController({ consultarHistorico }));
    return router;
}

module.exports = { criarRelatorioExcelRoutes };
