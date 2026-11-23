const { Router } = require('express');
const autenticar = require('../middlewares/produtoAuth');
const autorizar = require('../middlewares/adminOnly');
const { consultarDashboard } = require('../controllers/dashboardController');

const router = Router();

router.get('/dashboard', autenticar, autorizar, consultarDashboard);

module.exports = router;
