require('dotenv').config();
require('./src/config/database');

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const recuperacaoSenhaRoutes = require('./src/routes/recuperacaoSenhaRoutes');

// Permite receber dados em JSON
app.use(express.json());

// Permite receber dados de formulários
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos do Front-end
app.use(express.static(path.join(__dirname, 'views')));

// Rotas de usuários
app.use(usuarioRoutes);
app.use(recuperacaoSenhaRoutes);

// Rota inicial → login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});