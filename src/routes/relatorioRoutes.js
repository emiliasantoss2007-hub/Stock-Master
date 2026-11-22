const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');
const produtoAuth = require('../middlewares/produtoAuth');
const adminOnly = require('../middlewares/adminOnly');

// RF-17 — Relatório de estoque
router.get(
    '/estoque',
    produtoAuth,
    adminOnly,
    produtoController.relatorioEstoque
);

module.exports = router;