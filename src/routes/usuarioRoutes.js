const express =
    require('express');

const router =
    express.Router();

const usuarioController =
    require(
        '../controllers/usuarioController'
    );


/*
 * =====================================================
 * LISTAR USUÁRIOS
 * =====================================================
*/

router.get(
    '/',
    usuarioController.listarUsuarios
);


/*
 * =====================================================
 * BUSCAR USUÁRIO POR ID
 * =====================================================
 *
 * GET /api/usuarios/:id
 *
 * Utilizado pela tela de edição.
 *
 */

router.get(
    '/:id',
    usuarioController.buscarUsuario
);


/*
 * =====================================================
 * ATUALIZAR USUÁRIO
 * =====================================================
 *
 * PUT /api/usuarios/:id
 *
 */

router.put(
    '/:id',
    usuarioController.atualizarUsuario
);


module.exports =
    router;