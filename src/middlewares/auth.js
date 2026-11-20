const sessaoService = require('../services/sessaoService');

const COOKIE_SESSAO = 'stockmaster_session';

function obterCookie(req, nome) {
  const cookies = (req.headers.cookie || '').split(';');
  const cookie = cookies
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${nome}=`));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(nome.length + 1));
  } catch {
    return null;
  }
}

function auth(req, res, next) {
  // 1. Tenta pegar token pelo cookie de sessão (usado pelo navegador e pelo cookie do Thunder Client)
  let token = obterCookie(req, COOKIE_SESSAO);

  // 2. Se não vier por cookie, tenta pelo header Authorization: Bearer <token>
  if (!token) {
    const authorization = req.headers.authorization || '';
    const match = authorization.match(/^Bearer\s+(\S+)$/i);
    if (match) {
      token = match[1];
    }
  }

  const usuario = token && sessaoService.obterUsuario(token);

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