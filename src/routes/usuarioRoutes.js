const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

// RF-04 — Cadastro de usuário
router.post('/usuarios', usuarioController.cadastrarUsuario);

// RF-07 — Consultar usuários (com filtros opcionais)
router.get('/usuarios', auth, usuarioController.listarUsuarios);

// RF-05 — Edição de usuário
router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

module.exports = router;
router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

module.exports = router;