const produtoModel = require('../models/produtoModel');

function cadastrarProduto(req, res) {
    const dados = req.body || {};
    const camposObrigatorios = [
        ['nome', 'Nome é obrigatório'],
        ['categoria', 'Categoria é obrigatória'],
        ['sku', 'SKU é obrigatório']
    ];

    for (const [campo, mensagem] of camposObrigatorios) {
        if (typeof dados[campo] !== 'string' || !dados[campo].trim()) {
            return res.status(400).json({ message: mensagem });
        }
    }

    produtoModel.cadastrarProduto(dados, (erro, resultado) => {
        if (erro) {
            if (['SKU_DUPLICADO', 'ER_DUP_ENTRY', '23505'].includes(erro.code)) {
                return res.status(409).json({ message: 'SKU já cadastrado.' });
            }

            console.error('[StockMaster][ProdutoController] Erro ao cadastrar produto:', erro);
            return res.status(500).json({
                message: 'Erro interno ao cadastrar produto.',
                code: erro.code || 'INTERNAL_ERROR'
            });
        }

        return res.status(201).json({
            message: 'Produto cadastrado com sucesso.',
            id_produto: resultado.insertId
        });
    });
}

module.exports = { cadastrarProduto };