require('dotenv').config();
const express = require('express');
const path = require('path');

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');

require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'views')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.use('/api', usuarioRoutes);
app.use('/api', produtoRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});