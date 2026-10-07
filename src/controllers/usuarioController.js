const usuarioModel = require("../models/usuarioModel");
const UsuarioModel = usuarioModel;

// CADASTRAR USUÁRIO
const cadastrarUsuario = async (req, res) => {
    try {
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
                    return res.status(400).json({ message: "E-mail já cadastrado." });
                }
                return res.status(500).json({ message: err.message });
            }

            return res.status(201).json({
                message: "Usuário cadastrado com sucesso.",
                id_usuario: resultado.insertId
            });
        });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// EDITAR USUÁRIO
const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, login, id_nivel_acesso } = req.body;
        const usuarioLogado = req.usuario;

        // AUTORIZAÇÃO
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso negado. Apenas administradores podem editar usuários."
            });
        }

        // VALIDAÇÃO
        if (!id || !nome || !email || !login || !id_nivel_acesso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Preencha todos os campos obrigatórios."
            });
        }

        // BUSCAR USUÁRIO
        const usuarioExistente = await UsuarioModel.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        // VERIFICAR LOGIN E EMAIL
        const loginEmUso = await UsuarioModel.verificarLogin(login.trim(), id);
        if (loginEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O login informado já está em uso."
            });
        }

        const emailEmUso = await UsuarioModel.verificarEmail(email.trim(), id);
        if (emailEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O e-mail informado já está em uso."
            });
        }

        // ATUALIZAR (Utiliza transação se o método existir na model, ou fallback)
        const atualizarMetodo = UsuarioModel.atualizarComTransacao
            ? UsuarioModel.atualizarComTransacao.bind(UsuarioModel)
            : UsuarioModel.atualizar.bind(UsuarioModel);

        const usuarioAtualizado = await atualizarMetodo(
            id,
            nome.trim(),
            email.trim(),
            login.trim(),
            Number(id_nivel_acesso)
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: "Usuário atualizado com sucesso!",
            dadosAtualizados: usuarioAtualizado || {
                id_usuario: Number(id),
                nome: nome.trim(),
                email: email.trim(),
                login: login.trim(),
                id_nivel_acesso: Number(id_nivel_acesso)
            }
        });

    } catch (error) {
        console.error("Erro ao editar usuário:", error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                sucesso: false,
                mensagem: error.message
            });
        }
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno no servidor."
        });
    }
};

// CONSULTAR USUÁRIOS
const listarUsuarios = async