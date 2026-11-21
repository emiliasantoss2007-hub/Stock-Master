const { Router } = require('express');
const autenticar = require('../middlewares/produtoAuth');
const autorizar = require('../middlewares/adminOnly');
const { consultarHistorico } = require('../models/movimentacaoModel');
const { gerarRelatorioPdf } = require('../services/relatorioPdfService');
const { criarRelatorioPdfController } = require('../controllers/relatorioPdfController');

const router = Router();

router.get('/relatorio/movimentacoes/pdf', autenticar, autorizar,
    criarRelatorioPdfController({ consultarHistorico, gerarRelatorioPdf }));

module.exports = router;
