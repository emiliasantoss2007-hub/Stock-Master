const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Permite receber dados em JSON
app.use(express.json());

// Arquivos do Front-end
app.use(express.static(path.join(__dirname, 'views')));

// Rota de usuários
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use(usuarioRoutes);

// Rota inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});