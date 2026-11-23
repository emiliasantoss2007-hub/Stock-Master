
const { Router } = require('express');
const { criarRelatorioPdfController } = require('../controllers/relatorioPdfController');

function criarRelatorioPdfRoutes({
    autenticar,
    autorizar,
    consultarHistorico,
    listarRelatorioEstoque,
    consultarRelatorioProdutos,
    gerarRelatorioPdf
}) {
    const dependencias = [
        autenticar,
        autorizar,
        consultarHistorico,
        listarRelatorioEstoque,
        consultarRelatorioProdutos,
        gerarRelatorioPdf
    ];

    if (dependencias.some(dependencia => typeof dependencia !== 'function')) {
        throw new TypeError('A rota PDF exige todas as dependências necessárias.');
    }

    const router = Router();

    router.get(
        '/api/relatorio/:tipo/pdf',
        autenticar,
        autorizar,
        criarRelatorioPdfController({
            consultarHistorico,
            listarRelatorioEstoque,
            consultarRelatorioProdutos,
            gerarRelatorioPdf
        })
    );

    return router;
}

module.exports = { criarRelatorioPdfRoutes };
