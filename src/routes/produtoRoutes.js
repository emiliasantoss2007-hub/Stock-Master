const express = require('express');
const produtoController = require('../controllers/produtoController');
const auth = require('../middlewares/auth');
const produtoAccess = require('../middlewares/produtoAccess');

const router = express.Router();

router.post('/produtos', auth, produtoAccess, produtoController.cadastrarProduto);

module.exports = router;