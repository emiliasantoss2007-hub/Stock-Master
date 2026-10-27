const ProdutoModel = require('../models/produtoModel');

// RF-10 — Excluir produto
const excluirProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        // VALIDAR PERMISSÃO
        if (
            !usuarioLogado ||
            Number(usuarioLogado.id_nivel_acesso) !== 1
        ) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem excluir produtos.'
            });
        }

        // VALIDAR IDENTIFICADOR
        if (
            !id ||
            !Number.isInteger(Number(id)) ||
            Number(id) <= 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Identificador de produto inválido.'
            });
        }

        // EXECUTAR EXCLUSÃO COM VERIFICAÇÕES NO MODEL
        const resultado = await ProdutoModel.excluirComVerificacao(id);

        // RETORNAR SUCESSO
        return res.status(200).json({
            sucesso: true,
            mensagem: 'Produto excluído com sucesso.',
            idProduto: resultado.id_produto,
            operacao: 'exclusao'
        });

    } catch (error) {
        console.error('Erro ao excluir produto:', error);

        // TRATAR ERROS DE VALIDAÇÃO E REGRAS DE NEGÓCIO
        const errosConhecidos = {
            PRODUCT_ID_INVALID: {
                status: 400,
                mensagem: 'Identificador de produto inválido.'
            },
            PRODUCT_NOT_FOUND: {
                status: 404,
                mensagem: 'Produto não encontrado.'
            },
            PRODUCT_HAS_STOCK: {
                status: 409,
                mensagem: 'Não é possível excluir o produto enquanto houver saldo em estoque.'
            },
            PRODUCT_HAS_MOVEMENTS: {
                status: 409,
                mensagem: 'O produto possui movimentações e não pode ser excluído.'
            },
            PRODUCT_DELETE_NOT_CONFIRMED: {
                status: 409,
                mensagem: 'Não foi possível confirmar a exclusão do produto.'
            }
        };

        const erroConhecido = errosConhecidos[error.code];

        if (erroConhecido) {
            return res.status(erroConhecido.status).json({
                sucesso: false,
                mensagem: erroConhecido.mensagem,
                codigo: error.code
            });
        }

        // TRATAR RESTRIÇÕES DE CHAVES ESTRANGEIRAS
        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'O produto possui registros relacionados e não pode ser excluído.'
            });
        }

        // TRATAR ERRO INESPERADO
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao excluir produto.'
        });
    }
};

 // RF-12 — LISTAR PRODUTOS PARA ENTRADA
const listarParaEntrada = async (req, res) => {
    try {
        const produtos = await ProdutoModel.listarParaEntrada();

        return res.status(200).json({
            sucesso: true,
            produtos
        });
    } catch (erro) {
        console.error("Erro ao listar produtos para entrada:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao consultar os produtos."
        });
    }
};

// RF-12 — REGISTRAR ENTRADA
const registrarEntrada = async (req, res) => {
    try {
        const usuario = req.usuario;

        if (!usuario || !usuario.id_usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não autenticado."
            });
        }

        const { id_produto, quantidade } = req.body;

        const resultado = await ProdutoModel.registrarEntrada(
            id_produto,
            quantidade,
            usuario.id_usuario
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Entrada registrada com sucesso.",
            dados: resultado
        });
    } catch (erro) {
        const errosConhecidos = {
            PRODUCT_ID_INVALID: [400, "Identificador de produto inválido."],
            QUANTITY_INVALID: [400, "Informe uma quantidade inteira maior que zero."],
            USER_ID_INVALID: [401, "Usuário inválido."],
            PRODUCT_NOT_FOUND: [404, "Produto não encontrado."]
        };

        if (errosConhecidos[erro.code]) {
            const [status, mensagem] = errosConhecidos[erro.code];

            return res.status(status).json({
                sucesso: false,
                mensagem,
                codigo: erro.code
            });
        }

        console.error("Erro ao registrar entrada:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao registrar entrada."
        });
    }
};

module.exports = {
    excluirProduto,
    listarParaEntrada,
    registrarEntrada
};