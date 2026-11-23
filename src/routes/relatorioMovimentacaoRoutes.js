
const express = require('express');
const router = express.Router();

const produtoAuth = require('../middlewares/produtoAuth');
const adminOnly = require('../middlewares/adminOnly');
const relatorioMovimentacaoController = require('../controllers/relatorioMovimentacaoController');
const { consultarPreviaMovimentacoes } = require('../controllers/movimentacaoController');

router.get(
    '/relatorios/movimentacoes',
    produtoAuth,
    adminOnly,
    relatorioMovimentacaoController.gerarRelatorioMovimentacoes
);

router.get('/relatorios/movimentacoes/previa', produtoAuth, adminOnly, consultarPreviaMovimentacoes);

module.exports = router;
