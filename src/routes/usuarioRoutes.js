const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

// RF-07 — Consultar usuários (com filtros opcionais)
router.get('/usuarios', auth, usuarioController.listarUsuarios);

// RF-05 — Editar usuário
router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

module.exports = router;