const router = require('express').Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth'); // Seu middleware de autenticação

router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

module.exports = router;
