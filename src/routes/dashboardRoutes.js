const { Router } = require('express');
const autenticar = require('../middlewares/produtoAuth');
const autorizar = require('../middlewares/adminOnly');
const { consultarDashboard, consultarDashboardTecnico } = require('../controllers/dashboardController');

const router = Router();

router.get('/dashboard', autenticar, autorizar, consultarDashboard);
router.get('/dashboard/tecnico', autenticar, consultarDashboardTecnico);

module.exports = router;
