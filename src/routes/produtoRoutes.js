const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const auth = require('../middlewares/auth');

// Middlewares adicionais da branch develop (caso utilize especificamente para o cadastro)
const produtoAuth = require('../middlewares/produtoAuth');
const produtoCsrf = require('../middlewares/produtoCsrf');
const produtoAccess = require('../middlewares/produtoAccess');

// RF-01 — Cadastrar Produto
router.post('/produtos', produtoAuth, produtoCsrf, produtoAccess, produtoController.cadastrarProduto);

// RF-10 — EXCLUIR PRODUTO
router.delete('/produtos/:id', auth, produtoController.excluirProduto);

// RF-12 — LISTAR PRODUTOS PARA ENTRADA
router.get('/produtos/entrada/listar', auth, produtoController.listarParaEntrada);

// RF-12 — REGISTRAR ENTRADA
router.post('/produtos/entrada', auth, produtoController.registrarEntrada);

// RF-15 — Expurgo
router.get('/produtos/expurgo/listar', auth, produtoController.listarParaExpurgo);
router.post('/produtos/expurgo', auth, produtoController.registrarExpurgo);

// RF-17 — Relatório de estoque (JSON)
router.get('/relatorios/estoque', auth, produtoController.relatorioEstoque);

// RF-20 — Exportar relatório de estoque em PDF
router.get(
  '/relatorios/estoque/pdf',
  auth,
  produtoController.exportarRelatorioEstoquePdf
);

module.exports = router;