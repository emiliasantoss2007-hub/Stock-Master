const express = require("express");

const router = express.Router();

const usuarioController =
    require("../controllers/usuarioController");


/*
 * Buscar usuário
 *
 * GET /api/usuarios/:id
 */
router.get(
    "/:id",
    usuarioController.buscarUsuario
);


/*
 * Editar usuário
 *
 * PUT /api/usuarios/:id
 */
router.put(
    "/:id",
    usuarioController.atualizarUsuario
);


module.exports = router;