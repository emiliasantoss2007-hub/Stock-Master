
// Model responsável pelo cadastro e gerenciamento de usuário
const usuarioModel = require('../models/usuarioModel');
const UsuarioModel = usuarioModel;

// Controller responsável pelo cadastro de usuário
const cadastrarUsuario = async (req, res) => {

    // Recebe os dados enviados pelo Front-end
    const { nome, email, login, senha, perfil } = req.body ?? {};
    const textoPreenchido = valor => typeof valor === 'string' && Boolean(valor.trim());

    // Validação dos campos obrigatórios
    if (!textoPreenchido(nome)) {
        return res.status(400).json({
            message: "Nome é obrigatório"
        });
    }

    if (!textoPreenchido(email)) {
        return res.status(400).json({
            message: "Email é obrigatório"
        });
    }

    if (!textoPreenchido(login)) {
        return res.status(400).json({
            message: "Login é obrigatório"
        });
    }

    if (!textoPreenchido(senha)) {
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

    if (nome.trim().length > 100 || email.trim().length > 100 || login.trim().length > 50) {
        return res.status(400).json({ message: "Nome, e-mail ou login excede o tamanho permitido." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ message: "Informe um e-mail válido." });
    }
    if (senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
        return res.status(400).json({ message: "Informe uma senha com pelo menos 8 caracteres e no máximo 72 bytes." });
    }

    const dados = {
        nome: nome.trim(),
        email: email.trim(),
        login: login.trim(),
        senha,
        perfil
    };

    // Chama a função do Model para cadastrar o usuário
    usuarioModel.cadastrarUsuario(dados, (err, resultado) => {

        if (err) {

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    message: err.message?.includes("usuario.email")
                        ? "E-mail já cadastrado."
                        : "E-mail ou login já cadastrado."
                });
            }

            return res.status(500).json({
                message: "Não foi possível cadastrar o usuário."
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

        return res.set('Cache-Control', 'no-store').json({
            nome: usuario.nome,
            email: usuario.email,
            login: usuario.login,
            nivel: Number(usuario.id_nivel_acesso),
            perfil: usuario.perfil});

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


const atualizarMeuPerfil = async (req, res) => {
    try {
        const id = Number(req.usuario.id_usuario);
        const { nome, email } = req.body ?? {};

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Sessão inválida.'
            });
        }

        if (
            typeof nome !== 'string' ||
            typeof email !== 'string' ||
            !nome.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome e e-mail são obrigatórios.'
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim();

        if (nomeLimpo.length > 100 || emailLimpo.length > 100) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome ou e-mail excede o tamanho permitido.'
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Informe um e-mail válido.'
            });
        }

        const emailEmUso = await UsuarioModel.verificarEmail(emailLimpo, id);

        if (emailEmUso) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este e-mail já está sendo utilizado.'
            });
        }

        await UsuarioModel.atualizarMeuPerfil(id, nomeLimpo, emailLimpo);

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Dados atualizados com sucesso.',
            dados: {
                nome: nomeLimpo,
                email: emailLimpo
            }
        });

    } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este e-mail já está sendo utilizado.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar o perfil.'
        });
    }
};

const alterarSenhaDoPerfil = async (req, res) => {
    try {
        const id = Number(req.usuario.id_usuario);
        const { senhaAtual, novaSenha, confirmarSenha } = req.body ?? {};

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Sessão inválida.'
            });
        }

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos de senha.'
            });
        }

        if (novaSenha !== confirmarSenha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A confirmação da senha não confere.'
            });
        }

        const senhaValida =
            typeof novaSenha === 'string' &&
            novaSenha.length >= 8 &&
            Buffer.byteLength(novaSenha, 'utf8') <= 72 &&
            /[A-Z]/.test(novaSenha) &&
            /[a-z]/.test(novaSenha) &&
            /[0-9]/.test(novaSenha) &&
            /[^A-Za-z0-9]/.test(novaSenha);

        if (!senhaValida) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.'
            });
        }

        const resultado = await UsuarioModel.alterarSenhaDoPerfil(
            id,
            senhaAtual,
            novaSenha
        );

        if (!resultado.sucesso) {
            return res.status(
                resultado.motivo === 'SENHA_ATUAL_INCORRETA' ? 400 : 404
            ).json({
                sucesso: false,
                mensagem: resultado.motivo === 'SENHA_ATUAL_INCORRETA'
                    ? 'A senha atual está incorreta.'
                    : 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Senha alterada com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao alterar senha do perfil:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao alterar a senha.'
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
    excluirUsuario,
    atualizarMeuPerfil,
    alterarSenhaDoPerfil
};
