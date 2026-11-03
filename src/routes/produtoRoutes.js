const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const auth = require('../middlewares/auth');

// RF-10 — EXCLUIR PRODUTO
router.delete('/produtos/:id', auth, produtoController.excluirProduto);

// RF-12 — LISTAR PRODUTOS PARA ENTRADA
router.get('/produtos/entrada/listar', auth, produtoController.listarParaEntrada);

// RF-12 — REGISTRAR ENTRADA
router.post('/produtos/entrada', auth, produtoController.registrarEntrada);

module.exports = router;