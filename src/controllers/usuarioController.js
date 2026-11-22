
// Model responsável pelo cadastro e gerenciamento de usuário
const usuarioModel = require('../models/usuarioModel');
const UsuarioModel = usuarioModel;

// Controller responsável pelo cadastro de usuário
const cadastrarUsuario = async (req, res) => {

    // Recebe os dados enviados pelo Front-end
    const { nome, email, login, senha, perfil } = req.body;

    // Validação dos campos obrigatórios
    if (!nome) {
        return res.status(400).json({
            message: "Nome é obrigatório"
        });
    }

    if (!email) {
        return res.status(400).json({
            message: "Email é obrigatório"
        });
    }

    if (!login) {
        return res.status(400).json({
            message: "Login é obrigatório"
        });
    }

    if (!senha) {
        return res.status(400).json({
            message: "Senha é obrigatória"
        });
    }

    if (!perfil) {
        return res.status(400).json({
            message: "Perfil é obrigatório"
        });
    }

    // Validação do perfil
    if (perfil !== "Administrador" && perfil !== "Técnico") {
        return res.status(400).json({
            message: "Perfil inválido"
        });
    }

    const dados = {
        nome,
        email,
        login,
        senha,
        perfil
    };

    // Chama a função do Model para cadastrar o usuário
    usuarioModel.cadastrarUsuario(dados, (err, resultado) => {

        if (err) {

            if (err.code === "ER_DUP_ENTRY" && err.message.includes("usuario.email")) {
                return res.status(400).json({
                    message: "E-mail já cadastrado."
                });
            }

            return res.status(500).json({
                message: err.message
            });
        }

        return res.status(201).json({
            message: "Usuário cadastrado com sucesso.",
            id_usuario: resultado.insertId
        });
    });
};


// Controller responsável pela edição de usuário
const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, login, id_nivel_acesso } = req.body;
        const usuarioLogado = req.usuario;

        // Apenas administradores podem editar usuários
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem editar usuários.'
            });
        }

        // Validação dos dados recebidos
        if (!id || !nome || !email || !login || !id_nivel_acesso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios.'
            });
        }

        // Busca o usuário pelo ID
        const usuarioExistente = await UsuarioModel.buscarPorId(id);

        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        // Verifica se o login já está sendo utilizado
        const loginEmUso = await UsuarioModel.verificarLogin(login.trim(), id);

        if (loginEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O login informado já está em uso.'
            });
        }

        // Verifica se o e-mail já está sendo utilizado
        const emailEmUso = await UsuarioModel.verificarEmail(email.trim(), id);

        if (emailEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O e-mail informado já está em uso.'
            });
        }

        // Atualiza os dados do usuário
        await UsuarioModel.atualizar(
            id,
            nome.trim(),
            email.trim(),
            login.trim(),
            id_nivel_acesso
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso!',
            dadosAtualizados: {
                id_usuario: Number(id),
                nome: nome.trim(),
                email: email.trim(),
                login: login.trim(),
                id_nivel_acesso: Number(id_nivel_acesso)
            }
        });

    } catch (error) {
        console.error('Erro no RF-05 (editar usuário):', error);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno no servidor.'
        });
    }
};


// RF-05 - Buscar usuário por ID
const buscarUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        // Apenas administradores podem consultar usuários
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem consultar usuários.'
            });
        }

        // Valida o ID informado
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID de usuário inválido.'
            });
        }

        const usuario = await UsuarioModel.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json(usuario);

    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno no servidor.'
        });
    }
};


// RF - Consulta geral de usuários
const listarUsuarios = async (req, res) => {
    try {
        const usuarioLogado = req.usuario;

        // Apenas administradores podem consultar a lista de usuários
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem consultar usuários.'
            });
        }

        // Recebe os filtros enviados pela interface
        const {
            busca = '',
            perfil = '',
            status = '',
            ordenarPor = 'nome',
            direcao = 'asc'
        } = req.query;

        // Normaliza os parâmetros
        const filtros = {
            busca: typeof busca === 'string' ? busca.trim() : '',
            perfil: typeof perfil === 'string' ? perfil.trim() : '',
            status: typeof status === 'string' ? status.trim() : '',
            ordenarPor: typeof ordenarPor === 'string' ? ordenarPor.trim() : 'nome',
            direcao: typeof direcao === 'string' ? direcao.trim().toLowerCase() : 'asc'
        };

        // Valida o filtro de status
        if (!['', 'Ativo', 'Inativo'].includes(filtros.status)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Filtro de status inválido.',
                usuarios: []
            });
        }

        // Valida a coluna de ordenação
        const colunasPermitidas = ['nome', 'email', 'login', 'perfil', 'status'];

        if (!colunasPermitidas.includes(filtros.ordenarPor)) {
            filtros.ordenarPor = 'nome';
        }

        // Valida a direção da ordenação
        if (!['asc', 'desc'].includes(filtros.direcao)) {
            filtros.direcao = 'asc';
        }

        // Consulta os usuários no Model, aplicando os filtros
        const usuarios = await UsuarioModel.listar(filtros);

        return res.status(200).json({
            sucesso: true,
            total: usuarios.length,
            filtrosAplicados: filtros,
            usuarios
        });

    } catch (error) {
        console.error('Erro ao consultar usuários:', error);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao consultar usuários.',
            usuarios: []
        });
    }
};


// Exporta os Controllers para serem utilizados pelas rotas
module.exports = {
    cadastrarUsuario,
    editarUsuario,
    buscarUsuarioPorId,
    listarUsuarios
};