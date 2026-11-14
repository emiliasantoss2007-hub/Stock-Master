const express = require('express');
const router = express.Router();

// Importa o Controller do histórico de movimentações
const movimentacaoController = require('../controllers/movimentacaoController');

// RF-14 — Consultar Histórico de Estoque
router.get('/historico', movimentacaoController.consultarHistorico);

module.exports = router;