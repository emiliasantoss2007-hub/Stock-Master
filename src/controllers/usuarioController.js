const db = require('../config/database');

const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params; // Dados recebidos (ID do usuário)
        const { nome, email, login, status, id_nivel_acesso } = req.body; // Dados recebidos
        const usuarioLogado = req.usuario; // Obtido via middleware de autenticação

        // 1. Autorização verificada (RN04)
        if (!usuarioLogado || usuarioLogado.id_nivel_acesso !== 1) {
            return res.status(403).json({ 
                erro: 'Acesso negado. Apenas administradores podem editar usuários.' 
            });
        }

        // 2. Dados validados (Campos obrigatórios)
        if (!id || !nome || !email || !login || status === undefined || !id_nivel_acesso) {
            return res.status(400).json({ 
                erro: 'Preencha todos os campos obrigatórios.' 
            });
        }

        // 3. Usuário identificado (Verifica se o registro existe no banco)
        const [usuarioExistente] = await db.query(
            'SELECT * FROM usuario WHERE id_usuario = ?', 
            [id]
        );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({ 
                erro: 'Usuário não encontrado.' 
            });
        }

        // 4. Validação de duplicidade (Email ou login já pertencem a outro usuário)
        const [conflito] = await db.query(
            'SELECT * FROM usuario WHERE (email = ? OR login = ?) AND id_usuario <> ?', 
            [email, login, id]
        );

        if (conflito.length > 0) {
            return res.status(400).json({ 
                erro: 'O e-mail ou o login informado já está em uso.' 
            });
        }

        // 5. Model acionado (Executa o UPDATE no banco MySQL)
        await db.query(
            `UPDATE usuario 
             SET nome = ?, email = ?, login = ?, status = ?, id_nivel_acesso = ? 
             WHERE id_usuario = ?`,
            [nome, email, login, status, id_nivel_acesso, id]
        );

        // 6. Retorno implementado com sucesso
        return res.status(200).json({
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso!',
            dadosAtualizados: { id_usuario: Number(id), nome, email, login, status, id_nivel_acesso }
        });

    } catch (error) {
        console.error('Erro no RF-05:', error);
        return res.status(500).json({ 
            erro: 'Erro interno no servidor.' 
        });
    }
};

module.exports = {
    editarUsuario
};
