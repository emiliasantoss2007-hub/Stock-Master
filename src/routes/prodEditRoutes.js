"use strict";

const express = require("express");
const router = express.Router();

const produtoController = require("../controllers/prod_editController");

// Consultar produto pelo ID
router.get("/:id", produtoController.buscarProduto);

// Atualizar produto pelo ID
router.put("/:id", produtoController.editarProduto);

module.exports = router;