
"use strict";

const connection = require('../config/database');

async function consultarMovimentacoesParaRelatorio({
    dataInicio,
    dataFim,
    tipoMovimentacao,
    idUsuario
}) {
    let sql = `
        SELECT
            m.id_movimentacao,
            m.tipo_movimentacao,
            m.quantidade,
            m.justificativa,
            m.data_movimentacao,

            p.id_produto,
            p.sku,
            p.nome AS nome_produto,

            u.id_usuario,
            u.nome AS nome_usuario,
            u.login

        FROM movimentacao m
        INNER JOIN produto p
            ON p.id_produto = m.id_produto
        INNER JOIN usuario u
            ON u.id_usuario = m.id_usuario

        WHERE m.data_movimentacao >= ?
          AND m.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)
    `;

    const parametros = [
        `${dataInicio} 00:00:00`,
        dataFim
    ];

    if (tipoMovimentacao) {
        sql += `
            AND REPLACE(UPPER(TRIM(m.tipo_movimentacao)), 'Ã', 'I') = ?
        `;
        parametros.push(tipoMovimentacao);
    }

    if (idUsuario) {
        sql += ' AND m.id_usuario = ?';
        parametros.push(idUsuario);
    }

    sql += `
        ORDER BY m.data_movimentacao ASC, m.id_movimentacao ASC
    `;

    const resultados = await new Promise((resolve, reject) => {
        connection.query(sql, parametros, (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados);
        });
    });

    return resultados.map((mov) => ({
        id_movimentacao: mov.id_movimentacao,
        tipo_movimentacao: mov.tipo_movimentacao,
        quantidade: Number(mov.quantidade),
        justificativa: mov.justificativa,
        data_movimentacao: mov.data_movimentacao,

        produto: {
            id_produto: mov.id_produto,
            sku: mov.sku,
            nome: mov.nome_produto
        },

        usuario: {
            id_usuario: mov.id_usuario,
            nome: mov.nome_usuario,
            login: mov.login
        }
    }));
}

module.exports = {
    consultarMovimentacoesParaRelatorio
};