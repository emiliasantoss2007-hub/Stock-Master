const connection = require('../config/database');

function verificarSKU(sku, callback) {
    const skuNormalizado = String(sku || '').trim();

    if (!skuNormalizado) {
        return callback(null, false);
    }

    const sql = 'SELECT id_produto FROM produto WHERE sku = ?';

    connection.query(sql, [skuNormalizado], (erro, resultados) => {
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

        connection.query(sql, valores, (errInsert, resultado) => {
            if (errInsert) {
                return callback(errInsert);
            }

            callback(null, resultado);
        });
    });
}

function buscarPorId(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id_produto, sku, nome, categoria,
                   quantidade_estoque, valor
            FROM produto
            WHERE id_produto = ?
        `;

        connection.query(sql, [id], (erro, resultados) => {
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

        connection.query(sql, [idProduto], (erro, resultados) => {
            if (erro) return reject(erro);

            const produto = resultados[0];
            if (!produto) return resolve(null);

            resolve(Number(produto.quantidade_estoque));
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

        connection.query(sql, [idProduto], (erro, resultados) => {
            if (erro) return reject(erro);

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

        connection.query(sql, [idProduto], (erro, resultado) => {
            if (erro) return reject(erro);

            resolve(resultado.affectedRows > 0);
        });
    });
}

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

        connection.query(sql, (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados);
        });
    });
}

function registrarEntrada(idProduto, quantidade, idUsuario) {
    const idProd = Number(idProduto);
    const qtd = Number(quantidade);
    const idUser = Number(idUsuario);

    return new Promise((resolve, reject) => {
        if (!Number.isInteger(idProd) || idProd <= 0) {
            const erro = new Error('Identificador de produto inválido.');
            erro.code = 'PRODUCT_ID_INVALID';
            return reject(erro);
        }

        if (!Number.isInteger(qtd) || qtd <= 0) {
            const erro = new Error('Informe uma quantidade inteira maior que zero.');
            erro.code = 'QUANTITY_INVALID';
            return reject(erro);
        }

        if (!Number.isInteger(idUser) || idUser <= 0) {
            const erro = new Error('Usuário inválido.');
            erro.code = 'USER_ID_INVALID';
            return reject(erro);
        }

        connection.beginTransaction((erroInicio) => {
            if (erroInicio) return reject(erroInicio);

            connection.query(
                `SELECT id_produto, sku, nome, quantidade_estoque
                 FROM produto
                 WHERE id_produto = ?
                 FOR UPDATE`,
                [idProd],
                (erroProduto, resultados) => {
                    if (erroProduto) {
                        return connection.rollback(() => reject(erroProduto));
                    }

                    if (!resultados.length) {
                        const erro = new Error('Produto não encontrado.');
                        erro.code = 'PRODUCT_NOT_FOUND';
                        return connection.rollback(() => reject(erro));
                    }

                    const produto = resultados[0];
                    const saldoAnterior = Number(produto.quantidade_estoque);
                    const saldoNovo = saldoAnterior + qtd;

                    connection.query(
                        `UPDATE produto
                         SET quantidade_estoque = ?
                         WHERE id_produto = ?`,
                        [saldoNovo, idProd],
                        (erroAtualizacao) => {
                            if (erroAtualizacao) {
                                return connection.rollback(() => reject(erroAtualizacao));
                            }

                            connection.query(
                                `INSERT INTO movimentacao (
                                    tipo_movimentacao,
                                    quantidade,
                                    justificativa,
                                    id_produto,
                                    id_usuario
                                ) VALUES (?, ?, ?, ?, ?)`,
                                ['ENTRADA', qtd, null, idProd, idUser],
                                (erroMovimentacao, resultadoMovimentacao) => {
                                    if (erroMovimentacao) {
                                        return connection.rollback(() => reject(erroMovimentacao));
                                    }

                                    connection.commit((erroCommit) => {
                                        if (erroCommit) {
                                            return connection.rollback(() => reject(erroCommit));
                                        }

                                        resolve({
                                            idMovimentacao: resultadoMovimentacao.insertId,
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

function listarParaExpurgo() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                id_produto,
                sku,
                nome,
                quantidade_estoque
            FROM produto
            WHERE quantidade_estoque > 0
            ORDER BY nome ASC
        `;

        connection.query(sql, (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados);
        });
    });
}

async function registrarExpurgo(idProduto, quantidade, justificativa, idUsuario) {
    const idProd = Number(idProduto);
    const qtd = Number(quantidade);
    const idUser = Number(idUsuario);
    const motivo = String(justificativa || '').trim();

    if (!Number.isInteger(idProd) || idProd <= 0) {
        const erro = new Error('Identificador de produto inválido.');
        erro.code = 'PRODUCT_ID_INVALID';
        throw erro;
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
        const erro = new Error('Informe uma quantidade inteira maior que zero.');
        erro.code = 'QUANTITY_INVALID';
        throw erro;
    }

    if (!motivo) {
        const erro = new Error('A justificativa é obrigatória.');
        erro.code = 'JUSTIFICATION_REQUIRED';
        throw erro;
    }

    if (!Number.isInteger(idUser) || idUser <= 0) {
        const erro = new Error('Usuário inválido.');
        erro.code = 'USER_ID_INVALID';
        throw erro;
    }

    await new Promise((resolve, reject) => {
        connection.beginTransaction((erro) => {
            if (erro) return reject(erro);
            resolve();
        });
    });

    try {
        const query = (sql, parametros = []) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, parametros, (erro, resultado) => {
                    if (erro) return reject(erro);
                    resolve(resultado);
                });
            });
        };

        const produtos = await query(
            `SELECT id_produto, sku, nome, quantidade_estoque
             FROM produto
             WHERE id_produto = ?
             FOR UPDATE`,
            [idProd]
        );

        if (!produtos.length) {
            const erro = new Error('Produto não encontrado.');
            erro.code = 'PRODUCT_NOT_FOUND';
            throw erro;
        }

        const produto = produtos[0];
        const saldoAnterior = Number(produto.quantidade_estoque);

        if (qtd > saldoAnterior) {
            const erro = new Error('Quantidade de expurgo maior que o saldo disponível.');
            erro.code = 'INSUFFICIENT_STOCK';
            throw erro;
        }

        const saldoNovo = saldoAnterior - qtd;

        await query(
            `UPDATE produto
             SET quantidade_estoque = ?
             WHERE id_produto = ?`,
            [saldoNovo, idProd]
        );

        const movimentacao = await query(
            `INSERT INTO movimentacao (
                tipo_movimentacao,
                quantidade,
                justificativa,
                id_produto,
                id_usuario
            ) VALUES (?, ?, ?, ?, ?)`,
            ['EXPURGO', qtd, motivo, idProd, idUser]
        );

        await new Promise((resolve, reject) => {
            connection.commit((erro) => {
                if (erro) return reject(erro);
                resolve();
            });
        });

        return {
            idMovimentacao: movimentacao.insertId,
            idProduto: idProd,
            sku: produto.sku,
            nome: produto.nome,
            quantidade: qtd,
            saldoAnterior,
            saldoNovo,
            justificativa: motivo,
            idUsuario: idUser
        };

    } catch (erro) {
        await new Promise((resolve) => {
            connection.rollback(() => resolve());
        });

        throw erro;
    }
}



// RF-17 — Relatório de estoque
async function listarRelatorioEstoque(filtros = {}) {
    const {
        busca = '',
        categoria = '',
        apenasZerados = false
    } = filtros;

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

        const parametros = [];

        if (busca) {
            sql += ' AND (nome LIKE ? OR sku LIKE ?)';
            parametros.push(`%${busca}%`, `%${busca}%`);
        }

        if (categoria) {
            sql += ' AND categoria = ?';
            parametros.push(categoria);
        }

        if (apenasZerados) {
            sql += ' AND quantidade_estoque = 0';
        }

        sql += ' ORDER BY nome ASC';

        connection.query(sql, parametros, (erro, resultados) => {
            if (erro) return reject(erro);

            const itens = resultados.map((produto) => ({
                idProduto: produto.id_produto,
                sku: produto.sku,
                nome: produto.nome,
                categoria: produto.categoria,
                quantidadeEstoque: Number(produto.quantidade_estoque) || 0,
                valorUnitario: Number(produto.valor) || 0,
                valorEstoque: Number(produto.valor_estoque) || 0
            }));

            const resumo = {
                totalProdutos: itens.length,
                totalUnidades: itens.reduce(
                    (total, item) => total + item.quantidadeEstoque, 0
                ),
                valorTotalEstoque: itens.reduce(
                    (total, item) => total + item.valorEstoque, 0
                ),
                produtosZerados: itens.filter(
                    (item) => item.quantidadeEstoque === 0
                ).length
            };

            resolve({
                geradoEm: new Date(),
                filtrosAplicados: {
                    busca,
                    categoria,
                    apenasZerados
                },
                resumo,
                itens
            });
        });
    });
}

// CONSULTA DE PRODUTOS
function consultarProdutos(filtros = {}) {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT
                id_produto AS idProduto,
                sku,
                codigo_barras AS codigoBarras,
                nome,
                categoria,
                descricao,
                quantidade_estoque AS quantidadeEstoque,
                estoque_minimo AS estoqueMinimo,
                valor
            FROM produto
            WHERE 1 = 1
        `;

        const parametros = [];

        if (filtros.busca) {
            sql += ` AND (
                nome LIKE ?
                OR sku LIKE ?
                OR categoria LIKE ?
            )`;

            const termo = `%${filtros.busca}%`;
            parametros.push(termo, termo, termo);
        }

        if (filtros.nome) {
            sql += ' AND nome LIKE ?';
            parametros.push(`%${filtros.nome}%`);
        }

        if (filtros.categoria) {
            sql += ' AND categoria LIKE ?';
            parametros.push(`%${filtros.categoria}%`);
        }

        if (filtros.sku) {
            sql += ' AND sku = ?';
            parametros.push(filtros.sku);
        }

        sql += ' ORDER BY nome ASC';

        connection.query(sql, parametros, (erro, resultados) => {
            if (erro) {
                return reject(erro);
            }

            resolve(resultados);
        });
    });
}

module.exports = {
    cadastrarProduto,
    verificarSKU,
    verificarSku,
    buscarPorId,
    verificarSaldo,
    verificarMovimentacoes,
    listarParaEntrada,
    listarParaExpurgo,
    registrarEntrada,
    registrarExpurgo,
    excluir,
    listarRelatorioEstoque,
    consultarProdutos
};