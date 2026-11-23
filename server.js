require('dotenv').config();
require('./src/config/database');

const express = require('express');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const passRoutes = require('./src/routes/passRoutes');
const { criarRelatorioExcelRoutes } = require('./src/routes/relatorioExcelRoutes');
const { consultarHistorico } = require('./src/models/movimentacaoModel');
const { listarRelatorioEstoque } = require('./src/models/produtoModel');
const { consultarRelatorioProdutos } = require('./src/models/relatorioProdutoModel');
const autenticarRelatorio = require('./src/middlewares/produtoAuth');
const autorizarRelatorio = require('./src/middlewares/adminOnly');
const relatorioProdutoRoutes = require('./src/routes/relatorioProdutoRoutes');
const movimentacaoRoutes = require('./src/routes/movimentacaoRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
const relatorioRoutes = require('./src/routes/relatorioRoutes');
const prodEditRoutes = require('./src/routes/prodEditRoutes');
const saidaEstoqueRoutes = require('./src/routes/saidaEstoqueRoutes');
const relatorioMovimentacaoRoutes = require('./src/routes/relatorioMovimentacaoRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

const usuarioRoutes = require('./src/routes/usuarioRoutes');

// Permite receber dados em JSON
app.use(express.json());

// Permite receber dados de formulários
app.use(express.urlencoded({ extended: true }));

const sessaoService = require('./src/services/sessaoService');

const COOKIE_SESSAO = 'stockmaster_session';

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

app.use((req, res, next) => {
    const caminho = req.path.toLowerCase();

    // Verifica somente solicitações de páginas HTML
    if (!caminho.endsWith('.html')) {
        return next();
    }

    // Páginas que podem ser acessadas sem login
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

// Arquivos estáticos do Front-end
app.use(express.static(path.join(__dirname, 'views')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/auth', passRoutes);
app.use(criarRelatorioExcelRoutes({
    autenticar: autenticarRelatorio,
    autorizar: autorizarRelatorio,
    consultarHistorico,
    listarRelatorioEstoque,
    consultarRelatorioProdutos
}));
app.use('/api', relatorioProdutoRoutes);
app.use('/api', movimentacaoRoutes);
app.use('/api', produtoRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/produtos', prodEditRoutes);
app.use('/api/estoque/saida', saidaEstoqueRoutes);
app.use('/api', relatorioMovimentacaoRoutes);

// Rotas de usuários
app.use(usuarioRoutes);

// Rota inicial → login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});