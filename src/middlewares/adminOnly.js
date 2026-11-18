function adminOnly(req, res, next) {
    const idNivelAcesso = Number(req.usuario?.id_nivel_acesso);

    if (idNivelAcesso === 1) {
        return next();
    }

    return res.status(403).json({
        message: 'Acesso negado. Apenas administradores podem consultar relatórios.'
    });
}

module.exports = adminOnly;
