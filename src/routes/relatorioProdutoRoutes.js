const express = require('express');
const router = express.Router();

const produtoAuth = require('../middlewares/produtoAuth');
const adminOnly = require('../middlewares/adminOnly');
const relatorioProdutoController = require('../controllers/relatorioProdutoController');

// Rota para gerar o relatório de produtos
router.get(
    '/relatorio/produtos',
    produtoAuth,
    adminOnly,
    relatorioProdutoController.gerarRelatorioProdutos
);

module.exports = router;
