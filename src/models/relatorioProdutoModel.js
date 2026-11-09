const connection = require('../config/database');

function consultarRelatorioProdutos() {
    const sql = `
        SELECT
            p.nome,
            p.sku,
            p.codigo_barras,
            p.categoria,
            p.quantidade_estoque,
            p.marca
        FROM produto p
    `;

    return new Promise((resolve, reject) => {
        connection.query(sql, (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados);
        });
    });
}

module.exports = { consultarRelatorioProdutos };
