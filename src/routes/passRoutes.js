"use strict";

const express = require("express");
const passController = require("../controllers/passController");

const router = express.Router();

router.post(
    "/redefinir-senha",
    passController.alterarSenha
);

router.post(
    "/verificar-email",
    passController.verificarEmail
);

router.post(
    "/gerar-token",
    passController.gerarToken
);

router.post(
    "/validar-token",
    passController.validarToken
);

module.exports = router;