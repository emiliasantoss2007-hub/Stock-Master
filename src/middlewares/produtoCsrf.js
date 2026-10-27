function produtoCsrf(req, res, next) {
    if (req.authMethod === 'bearer') {
        return next();
    }

    const origem = req.get('origin');
    const origemAplicacao = process.env.APP_ORIGIN || `${req.protocol}://${req.get('host')}`;

    let origemValida = false;
    try {
        origemValida = Boolean(origem) && new URL(origem).origin === new URL(origemAplicacao).origin;
    } catch (erro) {
        origemValida = false;
    }

    if (!origemValida || !req.is('application/json')) {
        return res.status(403).json({
            message: 'Origem ou tipo de conteúdo não autorizado.'
        });
    }

    return next();
}

module.exports = produtoCsrf;