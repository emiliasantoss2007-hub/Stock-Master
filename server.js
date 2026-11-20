require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const passRoutes = require('./src/routes/passRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
// Se existir e você usar:
// const usuarioRoutes = require('./src/routes/usuarioRoutes');

const sessaoService = require('./src/services/sessaoService');

// Garante conexão com o banco ao subir o servidor
require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3001;
const COOKIE_SESSAO = 'stockmaster_session';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função auxiliar para extrair cookies
function obterCookie(req, nome) {
  const cookies = (req.headers.cookie || '').split(';');

  const cookie = cookies
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${nome}=`));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(nome.length + 1));
  } catch {
    return null;
  }
}

// Middleware de proteção de rotas HTML
app.use((req, res, next) => {
  const caminho = req.path.toLowerCase();

  if (!caminho.endsWith('.html')) {
    return next();
  }

  const paginasPublicas = [
    '/html/login.html',
    '/html/recuperar_senha.html',
    '/html/redefinir_senha.html'
  ];

  if (paginasPublicas.includes(caminho)) {
    return next();
  }

  const token = obterCookie(req, COOKIE_SESSAO);
  const usuario = token && sessaoService.obterUsuario(token);

  if (!usuario) {
    return res.redirect('/html/login.html');
  }

  next();
});

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'views')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/auth', passRoutes);
app.use('/api', produtoRoutes);
// app.use('/api', usuarioRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
