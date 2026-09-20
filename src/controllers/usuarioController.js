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

module.exports = { editarUsuario };