const recuperarSenha = async (req, res) => {

    try {

// Receber a identificação
// O Controller pega o e-mail enviado pelo front-end.

const {email} = req.body;
if (!email) {
    return res.status(400).json({mensagem :"E-mail é obrigatório"});
}

//Verificar se o e-mail foi informado

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
if (!emailValido) {
    return res.status(400).json({mensagem :"E-mail inválido"});
}

// Verificar se existe usuário cadastrado,
// seguindo a RN01 — Recuperação somente para usuários previamente cadastrados.

const usuario = await Usuario.usuarioModel.buscarPorEmail(email);

// Impedir a recuperação caso o usuário não exista

if (!usuario) {
    return res.status(404).json({mensagem :"Usuário não encontrado"});
}

// Iniciar o processo de recuperação

return res.status(200).json({mensagem :"E-mail validado, prossiga para redefinição de senha"});

//Capturar erros inesperados e retornar uma resposta de erro.

} catch (error) {

    return res.status(500).json({
    mensagem: "Erro interno ao processar a recuperação"
});

}
};

module.exports = { recuperarSenha };