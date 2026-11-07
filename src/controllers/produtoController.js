const produtoModel = require('../models/produtoModel');

function cadastrarProduto(req, res) {
    const dados = req.body || {};
    const camposObrigatorios = [
        ['nomeProduto', 'Nome do produto é obrigatório.'],
        ['sku', 'SKU é obrigatório.'],
        ['categoria', 'Categoria é obrigatória.']
    ];

    for (const [campo, mensagem] of camposObrigatorios) {
        if (typeof dados[campo] !== 'string' || !dados[campo].trim()) {
            return res.status(400).json({ message: mensagem });
        }
    }

    const valor = Number(dados.valorUnitario);
    if (
        dados.valorUnitario === undefined ||
        dados.valorUnitario === null ||
        dados.valorUnitario === '' ||
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        return res.status(400).json({ message: 'Informe um valor unitário válido.' });
    }

    const quantidade = Number(dados.quantidadeInicial);
    if (
        dados.quantidadeInicial === undefined ||
        dados.quantidadeInicial === null ||
        dados.quantidadeInicial === '' ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        return res.status(400).json({
            message: 'Informe uma quantidade inicial inteira maior que zero.'
        });
    }

    const estoqueMinimo = Number(dados.estoqueMinimo);
    if (
        dados.estoqueMinimo === undefined ||
        dados.estoqueMinimo === null ||
        dados.estoqueMinimo === '' ||
        !Number.isInteger(estoqueMinimo) ||
        estoqueMinimo < 0
    ) {
        return res.status(400).json({ message: 'Informe um estoque mínimo inteiro válido.' });
    }

    const dadosParaModel = {
        nome: dados.nomeProduto.trim(),
        sku: dados.sku.trim(),
        categoria: dados.categoria.trim(),
        valor,
        quantidade_estoque: quantidade,
        estoque_minimo: estoqueMinimo,
        descricao: typeof dados.descricao === 'string' && dados.descricao.trim()
            ? dados.descricao.trim()
            : null,
        codigo_barras: typeof dados.codigoBarras === 'string' && dados.codigoBarras.trim()
            ? dados.codigoBarras.trim()
            : null
    };

    produtoModel.cadastrarProduto(dadosParaModel, (erro, resultado) => {
        if (erro) {
            if (['SKU_DUPLICADO', 'ER_DUP_ENTRY', '23505'].includes(erro.code)) {
                return res.status(409).json({ message: 'SKU já cadastrado.' });
            }

            console.error('Erro ao cadastrar produto:', erro);
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
