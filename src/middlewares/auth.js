// Exemplo mínimo: lê usuário do header ou de uma sessão em memória
// Ajuste conforme o login que a equipe já implementou

function auth(req, res, next) {
  // Se já existir token/sessão no projeto, adapte aqui.
  // Exemplo com header Authorization Bearer + mapa de sessões:
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Placeholder: se a equipe já grava req.usuario em outro middleware, só chame next()
  if (req.usuario) {
    return next();
  }

  // Fallback de desenvolvimento: permite testar com header X-User-Json
  // Remova em produção
  const userHeader = req.headers['x-user'];
  if (userHeader) {
    try {
      req.usuario = JSON.parse(userHeader);
      return next();
    } catch (e) {
      // ignora
    }
  }

  return res.status(401).json({
    sucesso: false,
    mensagem: 'Acesso não autorizado. Faça login.'
  });
}

module.exports = auth;