const crypto = require('crypto');

const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;
const sessoes = new Map();

function criar(usuario) {
    const token = crypto.randomBytes(32).toString('hex');
    sessoes.set(token, {
        usuario,
        expiraEm: Date.now() + DURACAO_SESSAO_MS
    });
    return token;
}

function obterUsuario(token) {
    const sessao = sessoes.get(token);
    if (!sessao) return null;

    if (sessao.expiraEm <= Date.now()) {
        sessoes.delete(token);
        return null;
    }

    return sessao.usuario;
}

module.exports = { criar, obterUsuario };