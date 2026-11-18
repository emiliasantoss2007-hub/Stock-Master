const db = require('../config/database');

function buscarProdutoPorId(idProduto) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id_produto,
        sku,
        nome,
        quantidade_estoque
      FROM produto
      WHERE id_produto = ?
    `;

    db.query(sql, [idProduto], (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados[0] || null);
    });
  });
}

/**
 * Registra entrada de estoque:
 * - valida quantidade > 0
 * - confere se o produto existe (RN09)
 * - atualiza quantidade_estoque
 * - grava histórico em movimentacao (tipo ENTRADA)
 * - tudo em transação
 */
function registrarEntrada({ idProduto, quantidade, idUsuario, justificativa }) {
  const idProd = Number(idProduto);
  const qtd = Number(quantidade);
  const idUser = Number(idUsuario);
  const just = justificativa != null ? String(justificativa).trim() : null;

  return new Promise((resolve, reject) => {
    if (!idProd || idProd <= 0) {
      const e = new Error('Identificador de produto inválido.');
      e.code = 'VALIDACAO';
      return reject(e);
    }

    if (!Number.isFinite(qtd) || qtd <= 0 || !Number.isInteger(qtd)) {
      const e = new Error('A quantidade deve ser um número inteiro maior que zero.');
      e.code = 'VALIDACAO';
      return reject(e);
    }

    if (!idUser || idUser <= 0) {
      const e = new Error('Identificador de usuário (operador) inválido.');
      e.code = 'VALIDACAO';
      return reject(e);
    }

    db.beginTransaction((errBegin) => {
      if (errBegin) return reject(errBegin);

      // 1) Produto cadastrado? (RN09) — trava a linha
      db.query(
        `SELECT id_produto, sku, nome, quantidade_estoque
         FROM produto
         WHERE id_produto = ?
         FOR UPDATE`,
        [idProd],
        (errProd, rows) => {
          if (errProd) {
            return db.rollback(() => reject(errProd));
          }

          if (!rows.length) {
            return db.rollback(() => {
              const e = new Error(
                'Produto não encontrado. É necessário cadastrar o produto antes de registrar a entrada.'
              );
              e.code = 'RN09';
              reject(e);
            });
          }

          const produto = rows[0];
          const saldoAnterior = Number(produto.quantidade_estoque);
          const saldoNovo = saldoAnterior + qtd;

          // 2) Atualiza saldo
          db.query(
            `UPDATE produto
             SET quantidade_estoque = ?
             WHERE id_produto = ?`,
            [saldoNovo, idProd],
            (errUpd) => {
              if (errUpd) {
                return db.rollback(() => reject(errUpd));
              }

              // 3) Histórico — colunas reais da tabela movimentacao
              db.query(
                `INSERT INTO movimentacao (
                   tipo_movimentacao,
                   quantidade,
                   justificativa,
                   id_produto,
                   id_usuario
                 ) VALUES (?, ?, ?, ?, ?)`,
                ['ENTRADA', qtd, just, idProd, idUser],
                (errMov, resultMov) => {
                  if (errMov) {
                    return db.rollback(() => reject(errMov));
                  }

                  // 4) Confirma transação
                  db.commit((errCommit) => {
                    if (errCommit) {
                      return db.rollback(() => reject(errCommit));
                    }

                    resolve({
                      idMovimentacao: resultMov.insertId,
                      idProduto: idProd,
                      sku: produto.sku,
                      nome: produto.nome,
                      quantidade: qtd,
                      saldoAnterior,
                      saldoNovo,
                      idUsuario: idUser
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

module.exports = {
  buscarProdutoPorId,
  registrarEntrada
};