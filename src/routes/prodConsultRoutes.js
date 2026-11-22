"use strict";

const express = require("express");
const router = express.Router();

const ConsultaProdutoController = require("../controllers/prod_consultController");

router.get("/consulta", ConsultaProdutoController.consultarProdutos);

module.exports = router;