const { Router } = require('express');
const { criarRelatorioExcelController } = require('../controllers/relatorioExcelController');

function criarRelatorioExcelRoutes({
    autenticar,
    autorizar,
    consultarHistorico,
    listarRelatorioEstoque,
    consultarRelatorioProdutos
}) {
    const dependencias = [
        autenticar,
        autorizar,
        consultarHistorico,
        listarRelatorioEstoque,
        consultarRelatorioProdutos
    ];

    if (dependencias.some(dependencia => typeof dependencia !== 'function')) {
        throw new TypeError('A rota Excel exige todas as dependências necessárias.');
    }

    const router = Router();

    router.get(
        '/api/relatorio/:tipo/excel',
        autenticar,
        autorizar,
        criarRelatorioExcelController({
            consultarHistorico,
            listarRelatorioEstoque,
            consultarRelatorioProdutos
        })
    );

    return router;
}

module.exports = { criarRelatorioExcelRoutes };