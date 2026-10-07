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
        const emailEmUso = await UsuarioModel.verificarEmail(email.trim(), id);
        if (emailEmUso) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O e-mail informado já está em uso."
            });
        }

        // ATUALIZAR (Usa o método com transação se disponível ou fallback padrão)
        const atualizarMetodo = UsuarioModel.atualizarComTransacao
            ? UsuarioModel.atualizarComTransacao.bind(UsuarioModel)
            : UsuarioModel.atualizar.bind(UsuarioModel);
        // ATUALIZAR (Usa o método com transação se disponível ou fallback padrão)
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
const listarUsuarios = async (req, res) => {
    try {
        const { busca, perfil, status, ordenarPor, direcao } = req.query;
const listarUsuarios = async (req, res) => {
    try {
        const { busca, perfil, status, ordenarPor, direcao } = req.query;

        const filtros = {
            busca: busca ? busca.trim() : "",
            perfil: perfil ? perfil.trim() : "",
            status: status !== undefined ? status.trim() : "",
            ordenarPor: ordenarPor || "nome",
            direcao: direcao || "asc"
        };
        const filtros = {
            busca: busca ? busca.trim() : "",
            perfil: perfil ? perfil.trim() : "",
            status: status !== undefined ? status.trim() : "",
            ordenarPor: ordenarPor || "nome",
            direcao: direcao || "asc"
        };

        const usuarios = await UsuarioModel.listar(filtros);
        const usuarios = await UsuarioModel.listar(filtros);

        return res.status(200).json({
            sucesso: true,
            total: usuarios.length,
            filtrosAplicados: filtros,
            usuarios
        });
        return res.status(200).json({
            sucesso: true,
            total: usuarios.length,
            filtrosAplicados: filtros,
            usuarios
        });

    } catch (error) {
        console.error("Erro ao consultar usuários:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao consultar usuários.",
            usuarios: []
        });
    }
};
    } catch (error) {
        console.error("Erro ao consultar usuários:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao consultar usuários.",
            usuarios: []
        });
    }
};

// EXCLUIR USUÁRIO
const excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
const excluirUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso negado. Apenas administradores podem excluir usuários."
            });
        }
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso negado. Apenas administradores podem excluir usuários."
            });
        }

        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Identificador de usuário inválido."
            });
        }
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Identificador de usuário inválido."
            });
        }

        const usuarioExistente = await UsuarioModel.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }
        const usuarioExistente = await UsuarioModel.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const excluido = await UsuarioModel.excluir(id);
        if (!excluido) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Não foi possível excluir o usuário."
            });
        }
        const excluido = await UsuarioModel.excluir(id);
        if (!excluido) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Não foi possível excluir o usuário."
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Usuário excluído com sucesso.",
            idUsuario: Number(id)
        });
        return res.status(200).json({
            sucesso: true,
            mensagem: "Usuário excluído com sucesso.",
            idUsuario: Number(id)
        });

    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        ) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "O usuário possui registros relacionados e não pode ser excluído. Considere suspender o acesso."
            });
        }
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        ) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "O usuário possui registros relacionados e não pode ser excluído. Considere suspender o acesso."
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao excluir usuário."
        });
    }
};
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao excluir usuário."
        });
    }
};

// SUSPENDER USUÁRIO
const suspenderUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
const suspenderUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso negado. Apenas administradores podem suspender usuários."
            });
        }
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Acesso negado. Apenas administradores podem suspender usuários."
            });
        }

        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Identificador de usuário inválido."
            });
        }
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Identificador de usuário inválido."
            });
        }

        const usuarioExistente = await UsuarioModel.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }
        const usuarioExistente = await UsuarioModel.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const suspenso = await UsuarioModel.suspender(id);
        if (!suspenso) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Não foi possível suspender o usuário."
            });
        }
        const suspenso = await UsuarioModel.suspender(id);
        if (!suspenso) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Não foi possível suspender o usuário."
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Usuário suspenso com sucesso.",
            idUsuario: Number(id)
        });
        return res.status(200).json({
            sucesso: true,
            mensagem: "Usuário suspenso com sucesso.",
            idUsuario: Number(id)
        });

    } catch (error) {
        console.error("Erro ao suspender usuário:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao suspender usuário."
        });
    }
};
    } catch (error) {
        console.error("Erro ao suspender usuário:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao suspender usuário."
        });
    }
};

module.exports = {
    cadastrarUsuario,
    cadastrarUsuario,
    editarUsuario,
    listar
}