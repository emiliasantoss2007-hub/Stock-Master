function produtoAccess(req, res, next) {
    const usuario = req.usuario;
    const perfil = usuario && usuario.perfil;
    const perfilDescricao = typeof perfil === 'string'
        ? perfil
        : perfil && perfil.descricao;
    const perfilId = Number(
        usuario && (usuario.id_nivel_acesso ?? (perfil && perfil.id))
    );

    if ([1, 2].includes(perfilId) || ['Administrador', 'Técnico'].includes(perfilDescricao)) {
        return next();
    }

    return res.status(403).json({
        message: 'Acesso negado. Perfil sem permissão para cadastrar produtos.'
    });
}

module.exports = produtoAccess;