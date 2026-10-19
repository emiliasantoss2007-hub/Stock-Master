require('dotenv').config();
require('./src/config/database');

const express = require('express');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const passRoutes = require('./src/routes/passRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

/*
 * Middlewares para interpretação de dados
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * Disponibiliza arquivos estáticos (HTML, CSS, JS e imagens)
 */
app.use(express.static(path.join(__dirname, 'views')));
app.use('/src', express.static(path.join(__dirname, 'src')));

/*
 * Rotas da API
 */
app.use('/api/auth', authRoutes);
app.use('/api/auth', passRoutes);

/*
 * Rotas de usuários
 * (Com o prefixo /api/usuarios para manter a padronização REST)
 */
app.use('/api/usuarios', usuarioRoutes);

/*
 * Página inicial (Login)
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

/*
 * Inicialização do servidor
 */
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});