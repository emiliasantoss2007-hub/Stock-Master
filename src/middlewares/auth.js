
function auth(req, res, next) {
    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Acesso não autorizado. Faça login.'
        });
    }

    req.usuario = req.session.usuario;

    return next();
}

module.exports = auth;
