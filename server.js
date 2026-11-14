require('dotenv').config();
require('./src/config/database');

const express = require('express');
const path = require('path');
const sessionConfig = require('./src/config/session');

const authRoutes = require('./src/routes/authRoutes');
const passRoutes = require('./src/routes/passRoutes');
const movimentacaoRoutes = require('./src/routes/movimentacaoRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração de proxy para a futura hospedagem no Azure
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const usuarioRoutes = require('./src/routes/usuarioRoutes');

// Permite receber dados em JSON
app.use(express.json());

// Permite receber dados de formulários
app.use(express.urlencoded({ extended: true }));

// Gerenciamento de sessões com armazenamento no MySQL
app.use(sessionConfig);

// Arquivos estáticos do Front-end
app.use('/css', express.static(path.join(__dirname, 'views', 'css')));
app.use('/js', express.static(path.join(__dirname, 'views', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'views', 'assets')));

app.use('/src', express.static(path.join(__dirname, 'src')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/auth', passRoutes);
app.use('/api', movimentacaoRoutes);

// Rotas de usuários
app.use(usuarioRoutes);

// Controle de acesso às páginas HTML
const paginasPublicas = [
    'login.html',
    'recuperar_senha.html',
    'redefinir_senha.html'
];

const paginasPermitidas = [
    'cadastrar_produto.html',
    'cadastrar_usuarios.html',
    'dashboard_adm.html',
    'dashboard_tec.html',
    'editar_produto.html',
    'editar_usuario.html',
    'entrada_estoque.html',
    'expurgo_estoque.html',
    'historico_movimentacao.html',
    'perfil.html',
    'produtos.html',
    'produto_detalhes.html',
    'relatorios.html',
    'saída_estoque.html',
    'usuarios.html',
    'visualizar_relatorios.html'
];

app.get('/html/:pagina', (req, res) => {
    const pagina = req.params.pagina;

    if (!paginasPermitidas.includes(pagina) &&
        !paginasPublicas.includes(pagina)) {
        return res.sendStatus(404);
    }

    if (!paginasPublicas.includes(pagina) &&
        (!req.session || !req.session.usuario)) {
        return res.redirect('/html/login.html');
    }

    return res.sendFile(
        path.join(__dirname, 'views', 'html', pagina)
    );
});

// Rota inicial → login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'html', 'login.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});