const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');
const relatorioPdfController = require('../controllers/relatorioPdfController');
const produtoAuth = require('../middlewares/produtoAuth');

// RF-17 — Relatório de estoque
router.get('/estoque', produtoAuth, produtoController.relatorioEstoque);

// Exportação PDF
router.get('/estoque/pdf', produtoAuth, relatorioPdfController.exportarRelatorioEstoquePdf);

module.exports = router;