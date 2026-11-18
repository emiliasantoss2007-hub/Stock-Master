const sessaoService = require('../services/sessaoService');

function auth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  const usuario = match && sessaoService.obterUsuario(match[1]);

  if (usuario) {
    req.usuario = usuario;
    return next();
  }

  return res.status(401).json({
    sucesso: false,
    mensagem: 'Acesso não autorizado. Faça login.'
  });
}

module.exports = auth;