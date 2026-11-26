const sessaoService = require('../services/sessaoService');

const COOKIE_SESSAO = 'stockmaster_session';

function obterCookie(cookieHeader, nome) {
    if (!cookieHeader) return null;

    const cookie = cookieHeader
        .split(';')
        .map((parte) => parte.trim())
        .find((parte) => parte.startsWith(`${nome}=`));

    return cookie ? decodeURIComponent(cookie.slice(nome.length + 1)) : null;
}

function produtoAuth(req, res, next) {
    const authorization = req.headers.authorization || '';
    const match = authorization.match(/^Bearer\s+(\S+)$/i);
    const bearerToken = match && match[1];
    const cookieToken = obterCookie(req.headers.cookie, COOKIE_SESSAO);
    const token = bearerToken || cookieToken;
    const usuario = token && sessaoService.obterUsuario(token);

    if (usuario) {
        req.usuario = usuario;
        req.authMethod = bearerToken ? 'bearer' : 'cookie';
        return next();
    }

    return res.status(401).json({
        sucesso: false,
        mensagem: 'Acesso não autorizado. Faça login.'
    });
}

module.exports = produtoAuth;