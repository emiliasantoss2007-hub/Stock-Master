const express = require('express');
const produtoController = require('../controllers/produtoController');
const produtoAuth = require('../middlewares/produtoAuth');
const produtoCsrf = require('../middlewares/produtoCsrf');
const produtoAccess = require('../middlewares/produtoAccess');

const router = express.Router();

router.post('/produtos', produtoAuth, produtoCsrf, produtoAccess, produtoController.cadastrarProduto);

module.exports = router;