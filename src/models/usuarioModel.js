// Model responsável pelo cadastro e gerenciamento de usuário

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


// RF-05 — Buscar usuário por ID
function buscarPorId(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                u.id_usuario,
                u.nome,
                u.email,
                u.login,
                u.status,
                u.id_nivel_acesso,
                n.descricao AS perfil
            FROM usuario u
            INNER JOIN nivel_acesso n
                ON u.id_nivel_acesso = n.id_nivel_acesso
            WHERE u.id_usuario = ?
        `;

        connection.query(sql, [id], (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados[0] || null);
        });
    });
}

function verificarLogin(login, idUsuario) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE login = ?
                AND id_usuario <> ?
        `;

        db.query(sql, [login, idUsuario], (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados.length > 0);
        });
    });
}

// RF-05 — Verificar se e-mail já está em uso
function verificarEmail(email, idUsuario) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE email = ?
                AND id_usuario <> ?
        `;

        db.query(sql, [email, idUsuario], (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados.length > 0);
        });
    });
}

// RF-05 — Atualizar usuário
function atualizar(idUsuario, nome, email, login, idNivelAcesso) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE usuario
            SET
                nome = ?,
                email = ?,
                login = ?,
                id_nivel_acesso = ?
            WHERE id_usuario = ?
        `;

        db.query(
            sql,
            [nome, email, login, idNivelAcesso, idUsuario],
            (erro, resultado) => {
                if (erro) return reject(erro);
                resolve(resultado);
            }
        );
    });
}

function listar(filtros = {}) {
  return new Promise((resolve, reject) => {
    const { busca, perfil, status } = filtros;
    const params = [];

    let sql = `
      SELECT
        u.id_usuario,
        u.nome,
        u.email,
        u.login,
        u.status,
        u.id_nivel_acesso,
        n.descricao AS perfil
      FROM usuario u
      INNER JOIN nivel_acesso n
        ON u.id_nivel_acesso = n.id_nivel_acesso
      WHERE 1 = 1
    `;

    if (busca && String(busca).trim() !== '') {
      sql += ` AND (
        u.nome LIKE ?
        OR u.email LIKE ?
        OR u.login LIKE ?
      )`;
      const termo = `%${String(busca).trim()}%`;
      params.push(termo, termo, termo);
    }

    if (perfil !== undefined && perfil !== null && String(perfil).trim() !== '') {
      sql += ` AND u.id_nivel_acesso = ?`;
      params.push(Number(perfil));
    }

    if (status !== undefined && status !== null && String(status).trim() !== '') {
      sql += ` AND u.status = ?`;
      params.push(Number(status));
    }

    sql += ` ORDER BY u.nome ASC`;

    db.query(sql, params, (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados);
    });
  });
}

module.exports = {
  cadastrarUsuario,
  buscarPorId,
  verificarLogin,
  verificarEmail,
  atualizar,
  listar
};
};