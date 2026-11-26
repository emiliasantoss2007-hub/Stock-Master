
const express = require('express');
const autenticarSessao = require('../middlewares/produtoAuth');
const autorizarPerfil = require('../middlewares/produtoAccess');
const autorizarCadastro = require('../middlewares/adminOnly');
const protegerCadastro = require('../middlewares/produtoCsrf');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

// RF-04 — Cadastro de usuário
router.post('/usuarios', autenticarSessao, autorizarCadastro, protegerCadastro, usuarioController.cadastrarUsuario);

// RF - Consulta geral de usuários
router.get('/usuarios', auth, usuarioController.listarUsuarios);
router.get('/usuarios/me', autenticarSessao, autorizarPerfil, usuarioController.consultarMeuPerfil);


router.put(
    '/usuarios/me',
    autenticarSessao,
    autorizarPerfil,
    protegerCadastro,
    usuarioController.atualizarMeuPerfil
);

router.put(
    '/usuarios/me/senha',
    autenticarSessao,
    autorizarPerfil,
    protegerCadastro,
    usuarioController.alterarSenhaDoPerfil
);

// RF-05 — Consulta de usuário por ID
router.get('/usuarios/:id', auth, usuarioController.buscarUsuarioPorId);

// RF-05 — Edição de usuário
router.put('/usuarios/:id', auth, usuarioController.editarUsuario);

// RF - Exclusão de usuário
router.delete('/usuarios/:id', auth, usuarioController.excluirUsuario);

module.exports = router;
