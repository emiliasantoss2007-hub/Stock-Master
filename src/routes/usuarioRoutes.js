const express = require('express');
const router = express.Router();

const { cadastrarUsuario } = require('../controllers/usuarioController');

// Rota responsável pelo cadastro de usuário
router.post('/usuarios', cadastrarUsuario);

module.exports = router;