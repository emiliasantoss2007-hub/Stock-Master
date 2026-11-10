const express = require('express');
const router = express.Router();

const relatorioProdutoController = require('../controllers/relatorioProdutoController');

// Rota para gerar o relatório de produtos
router.get(
    '/relatorio/produtos',
    relatorioProdutoController.gerarRelatorioProdutos
);

module.exports = router;