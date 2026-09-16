const express = require("express");
const path = require("path");

const usuarioRoutes =
    require("./src/routes/usuarioRoutes");


const app = express();

const PORT = 3001;


/*
 * Permite receber JSON nas requisições
 */
app.use(express.json());


/*
 * Disponibiliza HTML, CSS, JS e imagens
 */
app.use(
    express.static(
        path.join(__dirname, "views")
    )
);


/*
 * Rotas de usuários
 */
app.use(
    "/api/usuarios",
    usuarioRoutes
);


/*
 * Página inicial
 */
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "views",
            "html",
            "login.html"
        )
    );

});


/*
 * Inicialização
 */
app.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );

});


/*
 * Conexão com banco
 */
require("./src/config/database");