"use strict";

const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

router.post("/login", AuthController.autenticar);
router.post("/logout", AuthController.sair);

module.exports = router;