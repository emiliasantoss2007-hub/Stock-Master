
"use strict";

const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const SaidaEstoqueController = require("../controllers/saidaEstoqueController");

// Todas as rotas exigem autenticação
router.use(auth);

// Consultar saldo de um produto
router.get("/:id/saldo", SaidaEstoqueController.consultarSaldo);

// Registrar saída de estoque
router.post("/", SaidaEstoqueController.registrarSaida);

module.exports = router;