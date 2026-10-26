const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const auth = require('../middlewares/auth');

// RF-10 — Excluir produto
router.delete('/produtos/:id', auth, produtoController.excluirProduto);

module.exports = router;