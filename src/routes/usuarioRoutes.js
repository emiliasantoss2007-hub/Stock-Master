const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

// RF-04 — Cadastro de usuário
router.post('/usuarios', usuarioController.cadastrarUsuario);

// RF-05 — Edição de usuário
router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

module.exports = router;