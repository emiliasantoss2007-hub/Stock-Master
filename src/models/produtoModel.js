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

module.exports = {
    cadastrarProduto,
    verificarSKU,
    verificarSku,
    buscarPorId,
    verificarSaldo,
    verificarMovimentacoes,
    excluir
};