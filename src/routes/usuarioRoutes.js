const express = require('express');

const router =
    express.Router();

const usuarioController =
    require('../controllers/usuarioController');


/*
 * Carrega os dados atuais do usuário.
 */
router.get(
    '/:id',
    usuarioController.buscarUsuario
);


/*
 * Atualiza os dados do usuário.
 */
router.put(
    '/:id',
    usuarioController.atualizarUsuario
);


module.exports = router;