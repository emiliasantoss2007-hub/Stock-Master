const express = require('express');

const router =
    express.Router();

const usuarioController =
    require('../controllers/usuarioController');


/*
 * RF-05
 *
 * Carrega os dados atuais do usuário
 * para preencher a tela de edição.
 */
router.get(
    '/:id',
    usuarioController.buscarUsuario
);


/*
 * RF-05
 *
 * Atualiza os dados cadastrais
 * e o perfil do usuário.
 */
router.put(
    '/:id',
    usuarioController.atualizarUsuario
);


module.exports = router;