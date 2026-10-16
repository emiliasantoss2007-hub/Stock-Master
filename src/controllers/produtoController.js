// Model responsável pelo cadastro de produtos
const produtoModel = require('../models/produtoModel');

// Controller responsável pelo cadastro de produtos
const cadastrarProduto = (req, res) => {

    // Recebe os dados enviados pelo Front-end
    const {
        nomeProduto,
        sku,
        categoria,
        valorUnitario,
        quantidadeInicial,
        estoqueMinimo,
        descricao
    } = req.body || {};

    // Validação do nome
    if (typeof nomeProduto !== 'string' || !nomeProduto.trim()) {
        return res.status(400).json({
            message: 'Nome do produto é obrigatório.'
        });
    }

    // Validação do SKU
    if (typeof sku !== 'string' || !sku.trim()) {
        return res.status(400).json({
            message: 'SKU é obrigatório.'
        });
    }

    // Validação da categoria
    if (typeof categoria !== 'string' || !categoria.trim()) {
        return res.status(400).json({
            message: 'Categoria é obrigatória.'
        });
    }

    // Validação do valor unitário
    const valor = Number(valorUnitario);

    if (
        valorUnitario === undefined ||
        valorUnitario === null ||
        valorUnitario === '' ||
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        return res.status(400).json({
            message: 'Informe um valor unitário válido.'
        });
    }

    // Validação da quantidade inicial
    const quantidade = Number(quantidadeInicial);

    if (
        quantidadeInicial === undefined ||
        quantidadeInicial === null ||
        quantidadeInicial === '' ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        return res.status(400).json({
            message: 'Informe uma quantidade inicial inteira maior que zero.'
        });
    }

    // Validação do estoque mínimo
    const minimo = Number(estoqueMinimo);

    if (
        estoqueMinimo === undefined ||
        estoqueMinimo === null ||
        estoqueMinimo === '' ||
        !Number.isInteger(minimo) ||
        minimo < 0
    ) {
        return res.status(400).json({
            message: 'Informe um estoque mínimo inteiro válido.'
        });
    }

    // Organiza os dados para o Model
    const dados = {
        nome: nomeProduto.trim(),
        sku: sku.trim(),
        categoria: categoria.trim(),
        valor,
        quantidade_estoque: quantidade,
        estoque_minimo: minimo,
        descricao:
            typeof descricao === 'string' && descricao.trim()
                ? descricao.trim()
                : null,
        codigo_barras: null
    };

    // Solicita ao Model o cadastro do produto
    produtoModel.cadastrarProduto(dados, (err, resultado) => {

        // Trata erros de cadastro
        if (err) {

            // SKU duplicado
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    message: 'SKU já cadastrado.'
                });
            }

            console.error('Erro ao cadastrar produto:', err);

            return res.status(500).json({
                message: 'Erro interno ao cadastrar produto.'
            });
        }

        // Retorna a confirmação do cadastro
        return res.status(201).json({
            message: 'Produto cadastrado com sucesso.',
            id_produto: resultado.insertId
        });
    });
};

// Exporta o Controller para utilização pelas rotas
module.exports = {
    cadastrarProduto
};