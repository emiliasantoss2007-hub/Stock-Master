const db = require('../config/database');

// --- Funções de Verificação e Cadastro (branch develop) ---

function verificarSKU(sku, callback) {
    const skuNormalizado = String(sku || '').trim();

    if (!skuNormalizado) {
        return callback(null, false);
    }

    const sql = 'SELECT id_produto FROM produto WHERE sku = ?';

    db.query(sql, [skuNormalizado], (erro, resultados) => {
        if (erro) {
            return callback(erro);
        }

        callback(null, resultados.length > 0);
    });
}

const verificarSku = verificarSKU;

function erroSkuDuplicado() {
    const erro = new Error('SKU já cadastrado');
    erro.code = 'SKU_DUPLICADO';
    return erro;
}

function cadastrarProduto(dados, callback) {
    const {
        sku,
        codigo_barras,
        nome,
        categoria,
        descricao,
        quantidade_estoque,
        estoque_minimo,
        valor
    } = dados || {};

    const skuNormalizado = String(sku || '').trim();
    const nomeNormalizado = String(nome || '').trim();
    const categoriaNormalizada = String(categoria || '').trim();

    if (!skuNormalizado || !nomeNormalizado || !categoriaNormalizada) {
        return callback(new Error('Nome, categoria e SKU são obrigatórios'));
    }

    const estoqueMinimo = Number(estoque_minimo ?? 0);
    if (!Number.isInteger(estoqueMinimo) || estoqueMinimo < 0) {
        return callback(new Error('Estoque mínimo deve ser um número inteiro não negativo'));
    }

    verificarSKU(skuNormalizado, (erro, jaExiste) => {
        if (erro) {
            return callback(erro);
        }

        if (jaExiste) {
            return callback(erroSkuDuplicado());
        }

        const sql = `
            INSERT INTO produto
            (sku, codigo_barras, nome, categoria, descricao, quantidade_estoque, estoque_minimo, valor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            skuNormalizado,
            codigo_barras || null,
            nomeNormalizado,
            categoriaNormalizada,
            descricao || null,
            Number(quantidade_estoque || 0),
            estoqueMinimo,
            valor === undefined || valor === null ? null : Number(valor)
        ];

        db.query(sql, valores, (errInsert, resultado) => {
            if (errInsert) {
                return callback(errInsert);
            }

            callback(null, resultado);
        });
    });
}

// --- Funções de Consulta, Exclusão, Movimentações e Relatórios (branch HEAD) ---

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
    const sql = `
      SELECT COUNT(*) AS total
      FROM movimentacao
      WHERE id_produto = ?
    `;

    db.query(sql, [idProduto], (erro, resultados) => {
      if (erro) {
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

// RF-12 — produtos para o select de entrada
function listarParaEntrada() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        id_produto,
        sku,
        nome,
        quantidade_estoque
      FROM produto
      ORDER BY nome ASC
    `;

    db.query(sql, (erro, resultados) => {
      if (erro) return reject(erro);
      resolve(resultados);
    });
  });
}

/**
 * RF-12 — Registrar entrada
 */
function registrarEntrada(idProduto, quantidade, idUsuario) {
  const idProd = Number(idProduto);
  const qtd = Number(quantidade);
  const idUser = Number(idUsuario);

  return new Promise((resolve, reject) => {
    if (!idProd || !Number.isInteger(idProd) || idProd <= 0) {
      const e = new Error('Identificador de produto inválido.');
      e.code = 'PRODUCT_ID_INVALID';
      return reject(e);
    }

    if (!Number.isFinite(qtd) || !Number.isInteger(qtd) || qtd <= 0) {
      const e = new Error('Informe uma quantidade inteira maior que zero.');
      e.code = 'QUANTITY_INVALID';
      return reject(e);
    }

    if (!idUser || !Number.isInteger(idUser) || idUser <= 0) {
      const e = new Error('Usuário inválido.');
      e.code = 'USER_ID_INVALID';
      return reject(e);
    }

    db.beginTransaction((errBegin) => {
      if (errBegin) return reject(errBegin);

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
              const e = new Error('Produto não encontrado.');
              e.code = 'PRODUCT_NOT_FOUND';
              reject(e);
            });
          }

          const produto = rows[0];
          const saldoAnterior = Number(produto.quantidade_estoque);
          const saldoNovo = saldoAnterior + qtd;

          db.query(
            `UPDATE produto
             SET quantidade_estoque = ?
             WHERE id_produto = ?`,
            [saldoNovo, idProd],
            (errUpd) => {
              if (errUpd) {
                return db.rollback(() => reject(errUpd));
              }

              db.query(
                `INSERT INTO movimentacao (
                   tipo_movimentacao,
                   quantidade,
                   justificativa,
                   id_produto,
                   id_usuario
                 ) VALUES (?, ?, ?, ?, ?)`,
                ['ENTRADA', qtd, null, idProd, idUser],
                (errMov, resultMov) => {
                  if (errMov) {
                    return db.rollback(() => reject(errMov));
                  }

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

/**
 * RF-15 — Registrar expurgo
 */
function registrarExpurgo(idProduto, quantidade, idUsuario, justificativa) {
  const idProd = Number(idProduto);
  const qtd = Number(quantidade);
  const idUser = Number(idUsuario);
  const motivo = justificativa != null ? String(justificativa).trim() : '';

  return new Promise((resolve, reject) => {
    if (!idProd || !Number.isInteger(idProd) || idProd <= 0) {
      const e = new Error('Identificador de produto inválido.');
      e.code = 'PRODUCT_ID_INVALID';
      return reject(e);
    }

    if (!Number.isFinite(qtd) || !Number.isInteger(qtd) || qtd <= 0) {
      const e = new Error('Informe uma quantidade inteira maior que zero.');
      e.code = 'QUANTITY_INVALID';
      return reject(e);
    }

    if (!idUser || !Number.isInteger(idUser) || idUser <= 0) {
      const e = new Error('Usuário inválido.');
      e.code = 'USER_ID_INVALID';
      return reject(e);
    }

    if (!motivo) {
      const e = new Error('A justificativa (motivo) é obrigatória para o expurgo.');
      e.code = 'JUSTIFICATIVA_REQUIRED';
      return reject(e);
    }

    db.beginTransaction((errBegin) => {
      if (errBegin) return reject(errBegin);

      db.query(
        `SELECT id_produto, sku, nome, quantidade_estoque
         FROM produto
         WHERE id_produto = ?
         FOR UPDATE`,
        [idProd],
        (errProd, rows) => {
          if (errProd) return db.rollback(() => reject(errProd));

          if (!rows.length) {
            return db.rollback(() => {
              const e = new Error('Produto não encontrado.');
              e.code = 'PRODUCT_NOT_FOUND';
              reject(e);
            });
          }

          const produto = rows[0];
          const saldoAnterior = Number(produto.quantidade_estoque);

          if (qtd > saldoAnterior) {
            return db.rollback(() => {
              const e = new Error(
                'Quantidade de expurgo maior que o saldo disponível em estoque.'
              );
              e.code = 'INSUFFICIENT_STOCK';
              reject(e);
            });
          }

          const saldoNovo = saldoAnterior - qtd;

          db.query(
            `UPDATE produto SET quantidade_estoque = ? WHERE id_produto = ?`,
            [saldoNovo, idProd],
            (errUpd) => {
              if (errUpd) return db.rollback(() => reject(errUpd));

              db.query(
                `INSERT INTO movimentacao (
                   tipo_movimentacao,
                   quantidade,
                   justificativa,
                   id_produto,
                   id_usuario
                 ) VALUES (?, ?, ?, ?, ?)`,
                ['EXPURGO', qtd, motivo, idProd, idUser],
                (errMov, resultMov) => {
                  if (errMov) return db.rollback(() => reject(errMov));

                  db.commit((errCommit) => {
                    if (errCommit) return db.rollback(() => reject(errCommit));

                    resolve({
                      idMovimentacao: resultMov.insertId,
                      idProduto: idProd,
                      sku: produto.sku,
                      nome: produto.nome,
                      quantidade: qtd,
                      justificativa: motivo,
                      saldoAnterior,
                      saldoNovo,
                      idUsuario: idUser,
                      operacao: 'expurgo'
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

/**
 * RF-17 — Relatório de estoque com filtros opcionais
 * filtros: { busca, categoria, apenasZerados }
 */
function listarRelatorioEstoque(filtros = {}) {
  const { busca, categoria, apenasZerados } = filtros;

  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        id_produto,
        sku,
        nome,
        categoria,
        quantidade_estoque,
        valor,
        (quantidade_estoque * IFNULL(valor, 0)) AS valor_estoque
      FROM produto
      WHERE 1 = 1
    `;
    const params = [];

    if (busca != null && String(busca).trim() !== '') {
      sql += ` AND (nome LIKE ? OR sku LIKE ?)`;
      const termo = `%${String(busca).trim()}%`;
      params.push(termo, termo);
    }

    if (categoria != null && String(categoria).trim() !== '') {
      sql += ` AND categoria = ?`;
      params.push(String(categoria).trim());
    }

    if (
      apenasZerados === true ||
      apenasZerados === 'true' ||
      apenasZerados === '1'
    ) {
      sql += ` AND quantidade_estoque = 0`;
    }

    sql += ` ORDER BY nome ASC`;

    db.query(sql, params, (erro, resultados) => {
      if (erro) return reject(erro);

      const itens = resultados.map((row) => ({
        idProduto: row.id_produto,
        sku: row.sku,
        nome: row.nome,
        categoria: row.categoria,
        quantidadeEstoque: Number(row.quantidade_estoque),
        valorUnitario: row.valor != null ? Number(row.valor) : null,
        valorEstoque: Number(row.valor_estoque)
      }));

      const totalItens = itens.length;
      const totalUnidades = itens.reduce(
        (acc, item) => acc + item.quantidadeEstoque,
        0
      );
      const valorTotalEstoque = itens.reduce(
        (acc, item) => acc + item.valorEstoque,
        0
      );
      const produtosZerados = itens.filter(
        (item) => item.quantidadeEstoque === 0
      ).length;

      resolve({
        geradoEm: new Date().toISOString(),
        filtrosAplicados: {
          busca: busca != null && String(busca).trim() !== '' ? String(busca).trim() : null,
          categoria:
            categoria != null && String(categoria).trim() !== ''
              ? String(categoria).trim()
              : null,
          apenasZerados:
            apenasZerados === true ||
            apenasZerados === 'true' ||
            apenasZerados === '1'
        },
        resumo: {
          totalItens,
          totalUnidades,
          valorTotalEstoque: Number(valorTotalEstoque.toFixed(2)),
          produtosZerados
        },
        itens
      });
    });
  });
}

/**
 * RF-20 — Prepara dados no formato do relatório PDF de estoque
 */
function prepararDadosExportacaoPdf(filtros = {}) {
  return listarRelatorioEstoque(filtros).then((relatorio) => {
    return {
      titulo: 'Relatório de Estoque',
      sistema: 'StockMaster',
      geradoEm: relatorio.geradoEm,
      filtros: relatorio.filtrosAplicados || {
        busca: null,
        categoria: null,
        apenasZerados: false
      },
      resumo: {
        totalItens: relatorio.resumo.totalItens,
        totalUnidades: relatorio.resumo.totalUnidades,
        valorTotalEstoque: relatorio.resumo.valorTotalEstoque,
        produtosZerados: relatorio.resumo.produtosZerados
      },
      colunas: [
        'sku',
        'nome',
        'categoria',
        'quantidadeEstoque',
        'valorUnitario',
        'valorEstoque'
      ],
      linhas: relatorio.itens.map((item) => ({
        sku: item.sku,
        nome: item.nome,
        categoria: item.categoria,
        quantidadeEstoque: item.quantidadeEstoque,
        valorUnitario: item.valorUnitario,
        valorEstoque: item.valorEstoque
      }))
    };
  });
}

module.exports = {
  cadastrarProduto,
  verificarSKU,
  verificarSku,
  buscarPorId,
  verificarSaldo,
  verificarMovimentacoes,
  excluir,
  listarParaEntrada,
  registrarEntrada,
  registrarExpurgo,
  listarRelatorioEstoque,
  prepararDadosExportacaoPdf
};
