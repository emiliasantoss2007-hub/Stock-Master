const db =
    require("../config/database");

// CONSULTAR USUÁRIOS

function listar(filtros = {}) {

    return new Promise(
        (resolve, reject) => {

            let sql = `
                SELECT
                    u.id_usuario,
                    u.nome,
                    u.email,
                    u.login,
                    u.id_nivel_acesso,
                    n.descricao AS perfil,
                    u.status
                FROM usuario u
                INNER JOIN nivel_acesso n
                    ON u.id_nivel_acesso =
                       n.id_nivel_acesso
                WHERE 1 = 1
            `;

            const parametros = [];

            // PESQUISA

            if (filtros.busca) {

                sql += `
                    AND (
                        u.nome LIKE ?
                        OR u.email LIKE ?
                        OR u.login LIKE ?
                    )
                `;

                const busca =
                    `%${filtros.busca}%`;

                parametros.push(
                    busca,
                    busca,
                    busca
                );
            }

            // FILTRO DE PERFIL

            if (filtros.perfil) {

                sql += `
                    AND n.descricao = ?
                `;

                parametros.push(
                    filtros.perfil
                );
            }

            // FILTRO DE STATUS

            if (
                filtros.status !== undefined &&
                filtros.status !== ""
            ) {

                const status =
                    filtros.status === "Ativo"
                        ? 1
                        : 0;

                sql += `
                    AND u.status = ?
                `;

                parametros.push(
                    status
                );
            }

            // ORDENAÇÃO

            const colunasPermitidas = {
                nome: "u.nome",
                email: "u.email",
                login: "u.login",
                perfil: "n.descricao",
                status: "u.status"
            };

            const coluna =
                colunasPermitidas[
                    filtros.ordenarPor
                ] || "u.nome";

            const direcao =
                String(
                    filtros.direcao
                ).toLowerCase() === "desc"
                    ? "DESC"
                    : "ASC";

            sql += `
                ORDER BY
                    ${coluna} ${direcao}
            `;

            db.query(
                sql,
                parametros,
                (erro, resultados) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultados
                    );
                }
            );
        }
    );
}

// BUSCAR USUÁRIO POR ID

function buscarPorId(id) {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    u.id_usuario,
                    u.nome,
                    u.email,
                    u.login,
                    u.id_nivel_acesso,
                    n.descricao AS perfil,
                    u.status
                FROM usuario u
                INNER JOIN nivel_acesso n
                    ON u.id_nivel_acesso =
                       n.id_nivel_acesso
                WHERE u.id_usuario = ?
            `;

            db.query(
                sql,
                [id],
                (erro, resultados) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultados[0]
                    );
                }
            );
        }
    );
}

// VERIFICAR LOGIN

function verificarLogin(
    login,
    idUsuario
) {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    id_usuario
                FROM usuario
                WHERE login = ?
                  AND id_usuario <> ?
                LIMIT 1
            `;

            db.query(
                sql,
                [
                    login,
                    idUsuario
                ],
                (erro, resultados) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultados.length > 0
                    );
                }
            );
        }
    );
}

// VERIFICAR E-MAIL

function verificarEmail(
    email,
    idUsuario
) {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    id_usuario
                FROM usuario
                WHERE email = ?
                  AND id_usuario <> ?
                LIMIT 1
            `;

            db.query(
                sql,
                [
                    email,
                    idUsuario
                ],
                (erro, resultados) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultados.length > 0
                    );
                }
            );
        }
    );
}

// ATUALIZAR USUÁRIO

async function atualizarComTransacao(
    idUsuario,
    nome,
    email,
    login,
    idNivelAcesso
) {

    await new Promise(
        (resolve, reject) => {

            db.beginTransaction(
                (erro) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve();
                }
            );
        }
    );

    try {

        const usuario =
            await query(
                `
                    SELECT
                        id_usuario
                    FROM usuario
                    WHERE id_usuario = ?
                    FOR UPDATE
                `,
                [idUsuario]
            );

        if (
            usuario.length === 0
        ) {

            throw Object.assign(
                new Error(
                    "Usuário não encontrado."
                ),
                {
                    statusCode: 404
                }
            );
        }

        const loginExistente =
            await query(
                `
                    SELECT
                        id_usuario
                    FROM usuario
                    WHERE login = ?
                      AND id_usuario <> ?
                    LIMIT 1
                `,
                [
                    login,
                    idUsuario
                ]
            );

        if (
            loginExistente.length > 0
        ) {

            throw Object.assign(
                new Error(
                    "O login informado já está em uso."
                ),
                {
                    statusCode: 409
                }
            );
        }

        const emailExistente =
            await query(
                `
                    SELECT
                        id_usuario
                    FROM usuario
                    WHERE email = ?
                      AND id_usuario <> ?
                    LIMIT 1
                `,
                [
                    email,
                    idUsuario
                ]
            );

        if (
            emailExistente.length > 0
        ) {

            throw Object.assign(
                new Error(
                    "O e-mail informado já está em uso."
                ),
                {
                    statusCode: 409
                }
            );
        }

        const resultado =
            await query(
                `
                    UPDATE usuario
                    SET
                        nome = ?,
                        email = ?,
                        login = ?,
                        id_nivel_acesso = ?
                    WHERE id_usuario = ?
                `,
                [
                    nome,
                    email,
                    login,
                    idNivelAcesso,
                    idUsuario
                ]
            );

        if (
            resultado.affectedRows !== 1
        ) {

            throw Object.assign(
                new Error(
                    "Nenhum usuário foi atualizado."
                ),
                {
                    statusCode: 409
                }
            );
        }

        await new Promise(
            (resolve, reject) => {

                db.commit(
                    (erro) => {

                        if (erro) {
                            return reject(erro);
                        }

                        resolve();
                    }
                );
            }
        );

        return await buscarPorId(
            idUsuario
        );

    } catch (erro) {

        await new Promise(
            (resolve) => {

                db.rollback(
                    () => resolve()
                );
            }
        );

        throw erro;
    }
}

// EXECUTAR QUERY

function query(
    sql,
    params
) {

    return new Promise(
        (resolve, reject) => {

            db.query(
                sql,
                params,
                (erro, resultados) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultados
                    );
                }
            );
        }
    );
}

module.exports = {

    listar,

    buscarPorId,

    verificarLogin,

    verificarEmail,

    atualizarComTransacao

};