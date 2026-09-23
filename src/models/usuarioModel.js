// Model responsável pelo cadastro de usuário (RF-04)

const connection = require('../config/database');
const bcrypt = require('bcrypt');

// Função responsável por preparar e executar o cadastro do usuário
const cadastrarUsuario = (dados, callback) => {

    // Recebe os dados enviados pelo Controller
    const { nome, email, login, senha, perfil } = dados;

    // Busca o nível de acesso correspondente ao perfil
    connection.query(
        'SELECT id_nivel_acesso FROM nivel_acesso WHERE descricao = ?',
        [perfil],
        (err, resultado) => {

            // Verifica se ocorreu erro na consulta
            if (err) {
                return callback(err);
            }

            // Verifica se o nível de acesso foi encontrado
            if (resultado.length === 0) {
                return callback(new Error('Nível de acesso não encontrado'));
            }

            // Obtém o ID do nível de acesso
            const id_nivel_acesso = resultado[0].id_nivel_acesso;

            // Gera o hash da senha
            bcrypt.hash(senha, 10, (err, senha_hash) => {

                // Verifica se ocorreu erro ao gerar o hash
                if (err) {
                    return callback(err);
                }

                // Comando SQL para cadastrar o usuário
                const sql = `
                    INSERT INTO usuario
                    (nome, email, login, senha_hash, status, id_nivel_acesso)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                // Valores que serão enviados para o SQL
                const valores = [
                    nome,
                    email,
                    login,
                    senha_hash,
                    true,
                    id_nivel_acesso
                ];

                // Executa o cadastro no banco
                connection.query(sql, valores, (err, resultado) => {

                    // Verifica se ocorreu erro no cadastro
                    if (err) {
                        return callback(err);
                    }

                    // Retorna o resultado do cadastro
                    callback(null, resultado);
                });
            });
        }
    );
};

// Exporta a função para ser utilizada pelo Controller
module.exports = {
    cadastrarUsuario
};

