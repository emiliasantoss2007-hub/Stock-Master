
const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const autenticarCadastro = require('../middlewares/produtoAuth');
const autorizarCadastro = require('../middlewares/adminOnly');
const protegerCadastro = require('../middlewares/produtoCsrf');

// RF-04 — Cadastro de usuário
router.post('/usuarios', autenticarCadastro, autorizarCadastro, protegerCadastro, usuarioController.cadastrarUsuario);

// RF - Consulta geral de usuários
router.get('/usuarios', auth, usuarioController.listarUsuarios);

// RF-05 — Consulta de usuário por ID
router.get('/usuarios/:id', auth, usuarioController.buscarUsuarioPorId);

// RF-05 — Edição de usuário
router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

module.exports = router;
