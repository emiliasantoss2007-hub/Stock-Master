const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');

// RF08 — Cadastro de produtos
router.post('/produtos', produtoController.cadastrarProduto);

module.exports = router;