const express = require('express');
const produtoController = require('../controllers/produtoController');
const auth = require('../middlewares/auth');
const produtoAuth = require('../middlewares/produtoAuth');
const produtoCsrf = require('../middlewares/produtoCsrf');
const produtoAccess = require('../middlewares/produtoAccess');

const router = express.Router();

router.post('/produtos', produtoAuth, produtoCsrf, produtoAccess, produtoController.cadastrarProduto);

router.delete('/produtos/:id', auth, produtoController.excluirProduto);

module.exports = router;