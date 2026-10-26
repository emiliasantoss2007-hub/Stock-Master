const db = require('../config/database');

function buscarPorId(id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id_produto,
        sku,
        nome,
        categoria,
        quantidade_estoque,
        valor
      FROM produto
      WHERE id_produto = ?
    `;

    db.query(sql, [id], (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados[0] || null);
    });
  });
}

function verificarSaldo(idProduto) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT quantidade_estoque
      FROM produto
      WHERE id_produto = ?
    `;

    db.query(sql, [idProduto], (erro, resultados) => {
      if (erro) return reject(erro);
      const row = resultados[0];
      if (!row) return resolve(null);
      resolve(Number(row.quantidade_estoque));
    });
  });
}

function verificarMovimentacoes(idProduto) {
  return new Promise((resolve, reject) => {
    // Se a tabela de movimentação tiver outro nome, ajuste aqui
    const sql = `
      SELECT COUNT(*) AS total
      FROM movimentacao
      WHERE id_produto = ?
    `;

    db.query(sql, [idProduto], (erro, resultados) => {
      if (erro) {
        // Tabela ainda não existe: trata como zero movimentações
        if (erro.code === 'ER_NO_SUCH_TABLE') return resolve(0);
        return reject(erro);
      }
      resolve(Number(resultados[0].total));
    });
  });
}

function excluir(idProduto) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM produto
      WHERE id_produto = ?
    `;

    db.query(sql, [idProduto], (erro, resultado) => {
      if (erro) return reject(erro);
      resolve(resultado.affectedRows > 0);
    });
  });
}

module.exports = {
  buscarPorId,
  verificarSaldo,
  verificarMovimentacoes,
  excluir
};
