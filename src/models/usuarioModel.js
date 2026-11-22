
// Model responsável pelo cadastro e gerenciamento de usuário

const connection = require('../config/database');
const bcrypt = require('bcrypt');

// Função responsável por preparar e executar o cadastro do usuário
const cadastrarUsuario = (dados, callback) => {

    const { nome, email, login, senha, perfil } = dados;

    connection.query(
        'SELECT id_nivel_acesso FROM nivel_acesso WHERE descricao = ?',
        [perfil],
        (err, resultado) => {

            if (err) {
                return callback(err);
            }

            if (resultado.length === 0) {
                return callback(new Error('Nível de acesso não encontrado'));
            }

            const id_nivel_acesso = resultado[0].id_nivel_acesso;

            bcrypt.hash(senha, 10, (err, senha_hash) => {

                if (err) {
                    return callback(err);
                }

                const sql = `
                    INSERT INTO usuario
                    (nome, email, login, senha_hash, status, id_nivel_acesso)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                const valores = [
                    nome,
                    email,
                    login,
                    senha_hash,
                    true,
                    id_nivel_acesso
                ];

                connection.query(sql, valores, (err, resultado) => {

                    if (err) {
                        return callback(err);
                    }

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


// RF-05 — Verificar se login já está em uso
function verificarLogin(login, idUsuario) {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE login = ?
                AND id_usuario <> ?
        `;

        connection.query(sql, [login, idUsuario], (erro, resultados) => {
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

        connection.query(sql, [email, idUsuario], (erro, resultados) => {
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

        connection.query(
            sql,
            [nome, email, login, idNivelAcesso, idUsuario],
            (erro, resultado) => {
                if (erro) return reject(erro);
                resolve(resultado);
            }
        );
    });
}


// RF - Consultar usuários
function listar(filtros = {}) {
    return new Promise((resolve, reject) => {

        const {
            busca = '',
            perfil = '',
            status = '',
            ordenarPor = 'nome',
            direcao = 'asc'
        } = filtros;

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

        const valores = [];

        if (busca) {
            sql += `
                AND (
                    u.nome LIKE ?
                    OR u.email LIKE ?
                    OR u.login LIKE ?
                )
            `;

            const termo = `%${busca}%`;
            valores.push(termo, termo, termo);
        }

        if (perfil) {
            sql += ` AND n.descricao = ?`;
            valores.push(perfil);
        }

        if (status !== '') {
            sql += ` AND u.status = ?`;
            valores.push(status === 'Ativo' ? 1 : 0);
        }

        // Colunas permitidas para ordenação
        const colunasPermitidas = {
            nome: 'u.nome',
            email: 'u.email',
            login: 'u.login',
            perfil: 'n.descricao',
            status: 'u.status'
        };

        const coluna = colunasPermitidas[ordenarPor] || 'u.nome';

        const direcaoSQL =
            String(direcao).toLowerCase() === 'desc'
                ? 'DESC'
                : 'ASC';

        sql += ` ORDER BY ${coluna} ${direcaoSQL}`;

        connection.query(sql, valores, (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados);
        });
    });
}


// Exporta as funções utilizadas pelos Controllers
module.exports = {
    cadastrarUsuario,
    buscarPorId,
    verificarLogin,
    verificarEmail,
    atualizar,
    listar
};