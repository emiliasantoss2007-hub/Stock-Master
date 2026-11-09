const UsuarioModel = require('../models/usuarioModel');

const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, login, id_nivel_acesso } = req.body;
    const usuarioLogado = req.usuario; // middleware de autenticação

    // 1. Autorização (RN04) — apenas Administrador
    if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas administradores podem editar usuários.'
      });
    }

    // 2. Validação dos dados recebidos
    if (!id || !nome || !email || !login || !id_nivel_acesso) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Preencha todos os campos obrigatórios.'
      });
    }

    // 3. Usuário identificado (Model)
    const usuarioExistente = await UsuarioModel.buscarPorId(id);

    if (!usuarioExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado.'
      });
    }

    // 4. Unicidade de login e e-mail (Model)
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

    // 5. Model acionado — atualização
    await UsuarioModel.atualizar(
      id,
      nome.trim(),
      email.trim(),
      login.trim(),
      id_nivel_acesso
    );

    // 6. Retorno de sucesso
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

const listarUsuarios = async (req, res) => {
  try {
    // 1. Filtros recebidos (query string)
    const { busca, perfil, status } = req.query;

    const filtros = {
      busca,
      perfil,
      status
    };

    // 2. Consulta acionada (Model)
    const usuarios = await UsuarioModel.listar(filtros);

    // 3. Retorno tratado
    return res.status(200).json({
      sucesso: true,
      total: usuarios.length,
      filtrosAplicados: {
        busca: busca || null,
        perfil: perfil || null,
        status: status || null
      },
      dados: usuarios
    });
  } catch (error) {
    // 4. Erros tratados
    console.error('Erro no RF-07 (consultar usuário):', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao consultar usuários.'
    });
  }
};

// Excluir usuário
const excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;

    // Autorização
    if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas administradores podem excluir usuários.'
      });
    }

    // Validar ID
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Identificador de usuário inválido.'
      });
    }

    // Verificar usuário
    const usuarioExistente = await UsuarioModel.buscarPorId(id);

    if (!usuarioExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado.'
      });
    }

    // Excluir
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

    // Usuário possui registros relacionados
    if (
      error.code === 'ER_ROW_IS_REFERENCED_2' ||
      error.code === 'ER_ROW_IS_REFERENCED'
    ) {
      return res.status(409).json({
        sucesso: false,
        mensagem:
          'O usuário possui registros relacionados e não pode ser excluído. Considere suspender o acesso.'
      });
    }

    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao excluir usuário.'
    });
  }
};

// Suspender usuário
const suspenderUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;

    // Autorização
    if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas administradores podem suspender usuários.'
      });
    }

    // Validar ID
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Identificador de usuário inválido.'
      });
    }

    // Verificar usuário
    const usuarioExistente = await UsuarioModel.buscarPorId(id);

    if (!usuarioExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado.'
      });
    }

    // Suspender
    const suspenso = await UsuarioModel.suspender(id);

    if (!suspenso) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Não foi possível suspender o usuário.'
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Usuário suspenso com sucesso.',
      idUsuario: Number(id)
    });
  } catch (error) {
    console.error('Erro ao suspender usuário:', error);

    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno ao suspender usuário.'
    });
  }
};

module.exports = {
  editarUsuario,
  listarUsuarios,
  excluirUsuario,
  suspenderUsuario
};