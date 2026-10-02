const express = require('express');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const passRoutes = require('./src/routes/passRoutes');

const app = express();
const PORT = 3001;

// Permite receber JSON nas requisições
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'views')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/auth', passRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

require('./src/config/database');