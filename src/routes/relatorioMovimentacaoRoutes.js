
const express = require('express');
const router = express.Router();

const produtoAuth = require('../middlewares/produtoAuth');
const adminOnly = require('../middlewares/adminOnly');
const relatorioMovimentacaoController = require('../controllers/relatorioMovimentacaoController');

router.get(
    '/relatorios/movimentacoes',
    produtoAuth,
    adminOnly,
    relatorioMovimentacaoController.gerarRelatorioMovimentacoes
);

module.exports = router;