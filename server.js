const express = require("express");

const path = require("path");


const usuarioRoutes =
    require("./src/routes/usuarioRoutes");


const app =
    express();


const PORT = 3001;


/*
 * Permite receber JSON nas requisições.
 */
app.use(
    express.json()
);


/*
 * Disponibiliza HTML, CSS, JS
 * e imagens da pasta views.
 */
app.use(
    express.static(
        path.join(
            __dirname,
            "views"
        )
    )
);


/*
 * Rotas de usuários.
 *
 * Todas as rotas definidas em
 * usuarioRoutes.js serão iniciadas por:
 *
 * /api/usuarios
 */
app.use(
    "/api/usuarios",
    usuarioRoutes
);


/*
 * Página inicial.
 */
app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "html",
                "login.html"
            )
        );

    }
);


/*
 * Inicialização do servidor.
 */
app.listen(
    PORT,
    () => {

        console.log(
            `Servidor rodando em http://localhost:${PORT}`
        );

    }
);


/*
 * Conexão com o banco de dados.
 */
require(
    "./src/config/database"
);