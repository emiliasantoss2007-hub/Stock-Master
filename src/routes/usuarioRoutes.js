const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");
const auth = require("../middlewares/auth");

// CADASTRAR USUÁRIO
router.post("/", auth, usuarioController.cadastrarUsuario);

// CONSULTAR USUÁRIOS
router.get("/", auth, usuarioController.listarUsuarios);

// EDITAR USUÁRIO
router.put("/:id", auth, usuarioController.editarUsuario);

// EXCLUIR USUÁRIO
router.delete("/:id", auth, usuarioController.excluirUsuario);

// SUSPENDER USUÁRIO
router.patch("/:id/suspender", auth, usuarioController.suspenderUsuario);

module.exports = router;