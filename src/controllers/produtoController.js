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

async function excluirProduto(req, res) {
    const id = Number(req.params.id);
    const usuario = req.usuario;

    // Verificar se o usuário é administrador
    if (!usuario || Number(usuario.id_nivel_acesso) !== 1) {
     return res.status(403).json({
         sucesso: false,
         mensagem: 'Apenas administradores podem excluir produtos.'
});
    }

    // Validar o ID
    if (!Number.isInteger(id) || id <= 0) {
 return res.status(400).json({
    sucesso: false,
    mensagem: 'ID do produto inválido.'
});
    }

    try {
        // Verificar se o produto existe
        const produto = await produtoModel.buscarPorId(id);

        if (!produto) {
        return res.status(404).json({
    sucesso: false,
    mensagem: 'Produto não encontrado.'
});
        }

        // Verificar se existe saldo em estoque
        const saldo = await produtoModel.verificarSaldo(id);

        if (saldo === null) {
           return res.status(404).json({
    sucesso: false,
    mensagem: 'Produto não encontrado.'
});
        }

        if (saldo > 0) {
            return res.status(409).json({
    sucesso: false,
    mensagem: 'Não é possível excluir um produto com saldo em estoque.'
});
        }

        // Verificar se existem movimentações
        const movimentacoes = await produtoModel.verificarMovimentacoes(id);

        if (movimentacoes > 0) {
            return res.status(409).json({
    sucesso: false,
    mensagem: 'Não é possível excluir um produto com movimentações registradas.'
});
        }

        // Excluir produto
        const excluido = await produtoModel.excluir(id);

        if (!excluido) {
           return res.status(409).json({
    sucesso: false,
    mensagem: 'Não foi possível excluir o produto.'
});
        }

        return res.status(200).json({
    sucesso: true,
    mensagem: 'Produto excluído com sucesso.',
    idProduto: id,
    operacao: 'exclusao'
});

    } catch (erro) {
        if (
            erro.code === 'ER_ROW_IS_REFERENCED_2' ||
            erro.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
    sucesso: false,
    mensagem: 'Não é possível excluir um produto vinculado a outras informações.'
});
        }

        console.error('Erro ao excluir produto:', erro);

       return res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno ao excluir produto.'
});
    }
}

async function listarParaEntrada(req, res) {
    try {
        const produtos = await produtoModel.listarParaEntrada();

        return res.status(200).json({
            sucesso: true,
            produtos
        });
    } catch (erro) {
        console.error('Erro ao listar produtos para entrada:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar produtos para entrada.'
        });
    }
}

async function registrarEntrada(req, res) {
    const usuario = req.usuario;

    if (!usuario || !usuario.id_usuario) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Usuário não autenticado.'
        });
    }

    const { id_produto, quantidade } = req.body || {};

    try {
        const resultado = await produtoModel.registrarEntrada(
            id_produto,
            quantidade,
            usuario.id_usuario
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Entrada de estoque registrada com sucesso.',
            dados: resultado
        });
    } catch (erro) {
        const errosValidacao = {
            PRODUCT_ID_INVALID: [400, 'Identificador de produto inválido.'],
            QUANTITY_INVALID: [400, 'Informe uma quantidade inteira maior que zero.'],
            USER_ID_INVALID: [401, 'Usuário inválido.'],
            PRODUCT_NOT_FOUND: [404, 'Produto não encontrado.']
        };

        if (errosValidacao[erro.code]) {
            const [status, mensagem] = errosValidacao[erro.code];

            return res.status(status).json({
                sucesso: false,
                mensagem
            });
        }

        console.error('Erro ao registrar entrada:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao registrar entrada de estoque.'
        });
    }
}

module.exports = {
    cadastrarProduto,
    excluirProduto,
    listarParaEntrada,
    registrarEntrada
};
