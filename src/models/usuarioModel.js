const db = require("../config/database");


/*
 * Busca um usuário pelo ID.
 *
 * Utilizado para:
 * - Identificar o usuário que será editado;
 * - Carregar os dados atuais na tela;
 * - Confirmar a persistência após a atualização.
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
    });
}


/*
 * Verifica se o login já está sendo utilizado
 * por outro usuário.
 */
function verificarLogin(
    login,
    idUsuario
) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE login = ?
              AND id_usuario <> ?
            LIMIT 1
        `;

        db.query(
            sql,
            [login, idUsuario],
            (erro, resultados) => {

                if (erro) {
                    return reject(erro);
                }

                resolve(
                    resultados.length > 0
                );
            }
        );
    });
}


/*
 * Verifica se o e-mail já está sendo utilizado
 * por outro usuário.
 */
function verificarEmail(
    email,
    idUsuario
) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT id_usuario
            FROM usuario
            WHERE email = ?
              AND id_usuario <> ?
            LIMIT 1
        `;

        db.query(
            sql,
            [email, idUsuario],
            (erro, resultados) => {

                if (erro) {
                    return reject(erro);
                }

                resolve(
                    resultados.length > 0
                );
            }
        );
    });
}


/*
 * Atualiza os dados do usuário utilizando
 * uma transação.
 *
 * Dados alterados:
 * - nome
 * - email
 * - login
 * - id_nivel_acesso
 *
 * O id_usuario é utilizado para identificar
 * o registro e não é alterado.
 *
 * senha_hash e status não fazem parte da
 * operação RF-05 definida anteriormente.
 */
async function atualizarComTransacao(
    idUsuario,
    nome,
    email,
    login,
    idNivelAcesso
) {

    /*
     * Inicia a transação.
     */
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

        /*
         * Verifica se o usuário existe.
         *
         * FOR UPDATE bloqueia o registro durante
         * a transação.
         */
        const usuario =
            await query(
                `
                    SELECT id_usuario
                    FROM usuario
                    WHERE id_usuario = ?
                    FOR UPDATE
                `,
                [idUsuario]
            );


        if (usuario.length === 0) {

            throw Object.assign(
                new Error(
                    "Usuário não encontrado."
                ),
                {
                    statusCode: 404
                }
            );
        }


        /*
         * Verifica duplicidade do login.
         */
        const loginExistente =
            await query(
                `
                    SELECT id_usuario
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


        if (loginExistente.length > 0) {

            throw Object.assign(
                new Error(
                    "O login informado já está em uso."
                ),
                {
                    statusCode: 409
                }
            );
        }


        /*
         * Verifica duplicidade do e-mail.
         */
        const emailExistente =
            await query(
                `
                    SELECT id_usuario
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


        if (emailExistente.length > 0) {

            throw Object.assign(
                new Error(
                    "O e-mail informado já está em uso."
                ),
                {
                    statusCode: 409
                }
            );
        }


        /*
         * Atualiza os dados.
         */
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


        /*
         * Garante que exatamente um usuário
         * tenha sido atualizado.
         */
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


        /*
         * Confirma a transação.
         */
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


        /*
         * Confirma a persistência fazendo
         * uma nova consulta após o COMMIT.
         */
        return await buscarPorId(
            idUsuario
        );


    } catch (erro) {

        /*
         * Caso qualquer etapa da operação
         * falhe, desfaz todas as alterações.
         */
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


/*
 * Função auxiliar para executar queries
 * utilizando Promise.
 */
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

    buscarPorId,

    verificarLogin,

    verificarEmail,

    atualizarComTransacao

};