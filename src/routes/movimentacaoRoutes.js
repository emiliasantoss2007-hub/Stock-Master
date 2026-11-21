const express = require('express');
const router = express.Router();

// Importa o Controller do histórico de movimentações
const movimentacaoController = require('../controllers/movimentacaoController');
const autenticar = require('../middlewares/produtoAuth');
const autorizar = require('../middlewares/adminOnly');

// RF-14 — Consultar Histórico de Estoque
router.get('/historico', movimentacaoController.consultarHistorico);
router.get('/relatorio/movimentacoes', autenticar, autorizar, movimentacaoController.consultarHistorico);

module.exports = router;
