
// Model responsável pelo cadastro e gerenciamento de usuário
const usuarioModel = require('../models/usuarioModel');
const UsuarioModel = usuarioModel;

// Controller responsável pelo cadastro de usuário
const cadastrarUsuario = async (req, res) => {
    const { nome, email, login, senha, perfil } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "Nome é obrigatório" });
    }

    if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
    }

    if (!login) {
        return res.status(400).json({ message: "Login é obrigatório" });
    }

    if (!senha) {
        return res.status(400).json({ message: "Senha é obrigatória" });
    }

    if (!perfil) {
        return res.status(400).json({ message: "Perfil é obrigatório" });
    }

    if (perfil !== "Administrador" && perfil !== "Técnico") {
        return res.status(400).json({ message: "Perfil inválido" });
    }

    const dados = { nome, email, login, senha, perfil };

    usuarioModel.cadastrarUsuario(dados, (err, resultado) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY" && err.message.includes("usuario.email")) {
                return res.status(400).json({
                    message: "E-mail já cadastrado."
                });
            }

            return res.status(500).json({ message: err.message });
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

        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem editar usuários.'
            });
        }

        if (!id || !nome || !email || !login || !id_nivel_acesso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios.'
            });
        }

        const usuarioExistente = await UsuarioModel.buscarPorId(id);

        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        const loginEmUso = await UsuarioModel.verificarLogin(login.trim(), id);

        if (loginEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O login informado já está em uso.'
            });
        }

        const emailEmUso = await UsuarioModel.verificarEmail(email.trim(), id);

        if (emailEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O e-mail informado já está em uso.'
            });
        }

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

        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem consultar usuários.'
            });
        }

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

        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem consultar usuários.'
            });
        }

        const {
            busca = '',
            perfil = '',
            status = '',
            ordenarPor = 'nome',
            direcao = 'asc'
        } = req.query;

        const filtros = {
            busca: typeof busca === 'string' ? busca.trim() : '',
            perfil: typeof perfil === 'string' ? perfil.trim() : '',
            status: typeof status === 'string' ? status.trim() : '',
            ordenarPor: typeof ordenarPor === 'string' ? ordenarPor.trim() : 'nome',
            direcao: typeof direcao === 'string' ? direcao.trim().toLowerCase() : 'asc'
        };

        if (!['', 'Ativo', 'Inativo'].includes(filtros.status)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Filtro de status inválido.',
                usuarios: []
            });
        }

        const colunasPermitidas = ['nome', 'email', 'login', 'perfil', 'status'];

        if (!colunasPermitidas.includes(filtros.ordenarPor)) {
            filtros.ordenarPor = 'nome';
        }

        if (!['asc', 'desc'].includes(filtros.direcao)) {
            filtros.direcao = 'asc';
        }

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

// Consulta o perfil do usuário autenticado
const consultarMeuPerfil = async (req, res) => {
    const id = Number(req.usuario.id_usuario);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(401).json({ mensagem: 'Sessão inválida.' });
    }

    try {
        const usuario = await UsuarioModel.buscarPorId(id);

        if (!usuario || Number(usuario.status) !== 1) {
            return res.status(404).json({
                mensagem: 'Perfil ativo não encontrado.'
            });
        }

        const { nome, login } = usuario;
        const nivel = Number(req.usuario.id_nivel_acesso);

        return res.set('Cache-Control', 'no-store').json({
            nome,
            login,
            nivel
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Não foi possível consultar o perfil.'
        });
    }
};

// RF - Excluir usuário
const excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem excluir usuários.'
            });
        }

        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Identificador de usuário inválido.'
            });
        }

        const usuarioExistente = await UsuarioModel.buscarPorId(id);

        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }

        const excluido = await UsuarioModel.excluir(id);

        if (!excluido) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Não foi possível excluir o usuário.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário excluído com sucesso.',
            idUsuario: Number(id)
        });

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'O usuário possui registros relacionados e não pode ser excluído.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao excluir usuário.'
        });
    }
};

// Exporta os Controllers para serem utilizados pelas rotas
module.exports = {
    consultarMeuPerfil,
    cadastrarUsuario,
    editarUsuario,
    buscarUsuarioPorId,
    listarUsuarios,
    excluirUsuario
};
