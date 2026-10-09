// Model responsável pelo cadastro e gerenciamento de usuário

const connection =
    require("../config/database");

const bcrypt =
    require("bcrypt");


// CADASTRAR USUÁRIO

const cadastrarUsuario =
    (dados, callback) => {

        const {
            nome,
            email,
            login,
            senha,
            perfil
        } = dados;

        // Buscar nível de acesso

        connection.query(
            `
                SELECT
                    id_nivel_acesso
                FROM nivel_acesso
                WHERE descricao = ?
            `,
            [perfil],
            (err, resultado) => {

                if (err) {
                    return callback(err);
                }

                if (
                    resultado.length === 0
                ) {

                    return callback(
                        new Error(
                            "Nível de acesso não encontrado"
                        )
                    );
                }

                const id_nivel_acesso =
                    resultado[0]
                        .id_nivel_acesso;

                // Gerar senha

                bcrypt.hash(
                    senha,
                    10,
                    (err, senha_hash) => {

                        if (err) {
                            return callback(err);
                        }

                        const sql = `
                            INSERT INTO usuario
                            (
                                nome,
                                email,
                                login,
                                senha_hash,
                                status,
                                id_nivel_acesso
                            )
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

                        connection.query(
                            sql,
                            valores,
                            (err, resultado) => {

                                if (err) {
                                    return callback(err);
                                }

                                callback(
                                    null,
                                    resultado
                                );
                            }
                        );
                    }
                );
            }
        );
    };


// CONSULTAR USUÁRIOS

function listar(
    filtros = {}
) {

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

            // Pesquisa

            if (
                filtros.busca
            ) {

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

            // Filtro de perfil

            if (
                filtros.perfil
            ) {

                sql += `
                    AND n.descricao = ?
                `;

                parametros.push(
                    filtros.perfil
                );
            }

            // Filtro de status

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

            // Ordenação

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

            connection.query(
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

function buscarPorId(
    id
) {

    return new Promise(
        (resolve, reject) => {

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
                    ON u.id_nivel_acesso =
                       n.id_nivel_acesso
                WHERE u.id_usuario = ?
            `;

            connection.query(
                sql,
                [id],
                (erro, resultados) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultados[0] || null
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

            connection.query(
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

            connection.query(
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

            connection.beginTransaction(
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

        // Verificar usuário

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

        // Verificar login

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

        // Verificar e-mail

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

        // Atualizar usuário

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

        // Confirmar transação

        await new Promise(
            (resolve, reject) => {

                connection.commit(
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

        // Desfazer transação

        await new Promise(
            (resolve) => {

                connection.rollback(
                    () => resolve()
                );
            }
        );

        throw erro;
    }
}


// EXCLUIR USUÁRIO

function excluir(
    idUsuario
) {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                DELETE FROM usuario
                WHERE id_usuario = ?
            `;

            connection.query(
                sql,
                [idUsuario],
                (erro, resultado) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultado.affectedRows === 1
                    );
                }
            );
        }
    );
}


// SUSPENDER USUÁRIO

function suspender(
    idUsuario
) {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                UPDATE usuario
                SET status = FALSE
                WHERE id_usuario = ?
            `;

            connection.query(
                sql,
                [idUsuario],
                (erro, resultado) => {

                    if (erro) {
                        return reject(erro);
                    }

                    resolve(
                        resultado.affectedRows === 1
                    );
                }
            );
        }
    );
}


// EXECUTAR QUERY

function query(
    sql,
    params
) {

    return new Promise(
        (resolve, reject) => {

            connection.query(
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


// EXPORTAR FUNÇÕES

module.exports = {

    cadastrarUsuario,

    listar,

    buscarPorId,

    verificarLogin,

    verificarEmail,

    atualizarComTransacao,

    excluir,

    suspender

};