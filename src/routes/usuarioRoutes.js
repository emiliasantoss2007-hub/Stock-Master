const express =
    require("express");

const router =
    express.Router();

const usuarioController =
    require("../controllers/usuarioController");

const auth =
    require("../middlewares/auth");

// CONSULTAR USUÁRIOS

router.get(
    "/",
    auth,
    usuarioController.listarUsuarios
);

// EDITAR USUÁRIO

router.put(
    "/:id",
    auth,
    usuarioController.editarUsuario
);

module.exports =
    router;