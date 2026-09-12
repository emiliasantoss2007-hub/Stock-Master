// Controller responsável pelo cadastro de usuário
const cadastrarUsuario = async (req, res) => {

    // Recebe os dados enviados pelo Front-end
    const { nome, email, login, senha, perfil } = req.body;

    // Validação dos campos obrigatórios
    if (!nome) {
        return res.status(400).json({
            message: "Nome é obrigatório"
        });
    }

    if (!email) {
        return res.status(400).json({
            message: "Email é obrigatório"
        });
    }

    if (!login) {
        return res.status(400).json({
            message: "Login é obrigatório"
        });
    }

    if (!senha) {
        return res.status(400).json({
            message: "Senha é obrigatória"
        });
    }

    if (!perfil) {
        return res.status(400).json({
            message: "Perfil é obrigatório"
        });
    }

    // Validação do perfil
    if (perfil !== "Administrador" && perfil !== "Técnico") {
        return res.status(400).json({
            message: "Perfil inválido"
        });
    }

    // Dados validados com sucesso
    return res.status(200).json({
        message: "Dados validados com sucesso."
    });
};

// Exporta o Controller para ser utilizado pelas rotas
module.exports = {
    cadastrarUsuario
};