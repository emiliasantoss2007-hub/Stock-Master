require('dotenv').config();
const express = require('express');
const path = require('path');

const usuarioRoutes = require('./src/routes/usuarioRoutes');

require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Lê JSON do body (necessário para o PUT de editar usuário)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'views')));

// Rotas da API (RF-05)
app.use('/api', usuarioRoutes);

// Página inicial → login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});