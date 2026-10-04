const express = require("express");
const router = express.Router();

const { recuperarSenha } = require("../controllers/recuperacaoSenhaController");

router.post("/recuperar-senha", recuperarSenha);

module.exports = router;