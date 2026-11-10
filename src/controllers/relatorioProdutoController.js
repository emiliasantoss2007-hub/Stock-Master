const relatorioProdutoModel = require('../models/relatorioProdutoModel');

// Controller responsável pela geração do relatório de produtos
const gerarRelatorioProdutos = async (req, res) => {

    try {
        const produtos = await relatorioProdutoModel.consultarRelatorioProdutos();

        const resultado = produtos.map(produto => ({
            nome: produto.nome,
            sku: produto.sku,
            codigo_barras: produto.codigo_barras,
            categoria: produto.categoria,
            quantidade_estoque: produto.quantidade_estoque
        }));

        return res.status(200).json(resultado);

    } catch (erro) {
        console.error('Erro ao gerar relatório de produtos:', erro);

        return res.status(500).json({
            message: 'Erro interno ao gerar relatório de produtos.'
        });
    }
};

module.exports = {
    gerarRelatorioProdutos
};