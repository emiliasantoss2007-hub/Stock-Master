const db = require("../config/database");


/*
 * Busca um usuário pelo ID
 */
function buscarPorId(id) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                u.id_usuario,
                u.nome,
                u.email,
                u.login,
                u.id_nivel_acesso,
                n.descricao AS perfil
            FROM usuario u
            INNER JOIN nivel_acesso n
                ON u.id_nivel_acesso = n.id_nivel_acesso
            WHERE u.id_usuario = ?
        `;

        db.query(sql, [id], (erro, resultados) => {

            if (erro) {
                reject(erro);
                return;
            }

            resolve(resultados[0]);

        });

    });

}


/*
 * Verifica se o login já pertence a outro usuário
 */
function verificarLogin(login, idUsuario) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE login = ?
            AND id_usuario <> ?
        `;

        db.query(
            sql,
            [login, idUsuario],
            (erro, resultados) => {

                if (erro) {
                    reject(erro);
                    return;
                }

                resolve(resultados.length > 0);

            }
        );

    });

}


/*
 * Verifica se o e-mail já pertence a outro usuário
 */
function verificarEmail(email, idUsuario) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE email = ?
            AND id_usuario <> ?
        `;

        db.query(
            sql,
            [email, idUsuario],
            (erro, resultados) => {

                if (erro) {
                    reject(erro);
                    return;
                }

                resolve(resultados.length > 0);

            }
        );

    });

}


/*
 * Atualiza os dados do usuário
 */
function atualizar(
    idUsuario,
    nome,
    email,
    login,
    idNivelAcesso
) {

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
            [
                nome,
                email,
                login,
                idNivelAcesso,
                idUsuario
            ],
            (erro, resultado) => {

                if (erro) {
                    reject(erro);
                    return;
                }

                resolve(resultado);

            }
        );

    });

}


module.exports = {
    buscarPorId,
    verificarLogin,
    verificarEmail,
    atualizar
};