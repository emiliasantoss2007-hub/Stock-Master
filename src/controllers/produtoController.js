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

// RF-12 — VALIDAR E REGISTRAR ENTRADA
const registrarEntrada = async (req, res) => {
    try {
        // VALIDAR USUÁRIO
        const usuario = req.usuario;

        if (!usuario || !usuario.id_usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não autenticado."
            });
        }

        const idUsuario = Number(usuario.id_usuario);

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Identificação do usuário inválida."
            });
        }

        // VALIDAR DADOS RECEBIDOS
        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Dados da entrada não foram informados."
            });
        }

        const { id_produto, quantidade } = req.body;

        // VALIDAR PRODUTO
        const produtoValido =
            id_produto !== undefined &&
            id_produto !== null &&
            String(id_produto).trim() !== "" &&
            /^\d+$/.test(String(id_produto)) &&
            Number.isInteger(Number(id_produto)) &&
            Number(id_produto) > 0;

        if (!produtoValido) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Selecione um produto válido.",
                codigo: "PRODUCT_ID_INVALID"
            });
        }

        // VALIDAR QUANTIDADE
        const quantidadeValida =
            quantidade !== undefined &&
            quantidade !== null &&
            String(quantidade).trim() !== "" &&
            /^\d+$/.test(String(quantidade)) &&
            Number.isInteger(Number(quantidade)) &&
            Number(quantidade) > 0;

        if (!quantidadeValida) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe uma quantidade inteira maior que zero.",
                codigo: "QUANTITY_INVALID"
            });
        }

        // ACIONAR MODEL
        const resultado = await ProdutoModel.registrarEntrada(
            Number(id_produto),
            Number(quantidade),
            idUsuario
        );

        // RETORNAR SUCESSO
        return res.status(201).json({
            sucesso: true,
            mensagem: "Entrada registrada com sucesso.",
            dados: resultado
        });

    } catch (erro) {
        // TRATAR ERROS DO MODEL
        const errosConhecidos = {
            PRODUCT_ID_INVALID: {
                status: 400,
                mensagem: "Identificador de produto inválido."
            },
            QUANTITY_INVALID: {
                status: 400,
                mensagem: "Informe uma quantidade inteira maior que zero."
            },
            USER_ID_INVALID: {
                status: 401,
                mensagem: "Usuário inválido."
            },
            PRODUCT_NOT_FOUND: {
                status: 404,
                mensagem: "O produto informado não está cadastrado."
            }
        };

        const erroConhecido = errosConhecidos[erro.code];

        if (erroConhecido) {
            return res.status(erroConhecido.status).json({
                sucesso: false,
                mensagem: erroConhecido.mensagem,
                codigo: erro.code
            });
        }

        // TRATAR ERRO INESPERADO
        console.error("Erro ao registrar entrada:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao registrar entrada."
        });
    }
};

// RF-15 — LISTAR PRODUTOS PARA EXPURGO
const listarParaExpurgo = async (req, res) => {
    try {
        const produtos = await ProdutoModel.listarParaEntrada();
        // reutiliza a mesma listagem (id, sku, nome, quantidade_estoque)

        return res.status(200).json({
            sucesso: true,
            produtos
        });
    } catch (erro) {
        console.error('Erro ao listar produtos para expurgo:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao consultar os produtos.'
        });
    }
};

// RF-15 — REGISTRAR EXPURGO
const registrarExpurgo = async (req, res) => {
    try {
        const usuarioLogado = req.usuario;

        // 1. Administrador validado (expurgo exclusivo do Admin)
        if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Acesso negado. Apenas administradores podem registrar expurgo.'
            });
        }

        if (!usuarioLogado.id_usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário não autenticado.'
            });
        }

        const { id_produto, quantidade, justificativa } = req.body;

        // 2. Produto validado (id)
        const idProduto = Number(id_produto);
        if (!id_produto || !Number.isInteger(idProduto) || idProduto <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Identificador de produto inválido.',
                codigo: 'PRODUCT_ID_INVALID'
            });
        }

        // 3. Quantidade
        const qtd = Number(quantidade);
        if (!Number.isFinite(qtd) || !Number.isInteger(qtd) || qtd <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Informe uma quantidade inteira maior que zero.',
                codigo: 'QUANTITY_INVALID'
            });
        }

        // 4. Motivo obrigatório (RN12)
        const motivo =
            justificativa != null ? String(justificativa).trim() : '';

        if (!motivo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A justificativa é obrigatória para o expurgo.',
                codigo: 'JUSTIFICATIVA_REQUIRED'
            });
        }

        // 5. Model acionado (valida produto, saldo e grava histórico)
        const resultado = await ProdutoModel.registrarExpurgo(
            idProduto,
            qtd,
            Number(usuarioLogado.id_usuario),
            motivo
        );

        // 6. Retorno implementado
        return res.status(201).json({
            sucesso: true,
            mensagem: 'Expurgo registrado com sucesso.',
            dados: resultado
        });
    } catch (erro) {
        const errosConhecidos = {
            PRODUCT_ID_INVALID: [400, 'Identificador de produto inválido.'],
            QUANTITY_INVALID: [400, 'Informe uma quantidade inteira maior que zero.'],
            USER_ID_INVALID: [401, 'Usuário inválido.'],
            PRODUCT_NOT_FOUND: [404, 'Produto não encontrado.'],
            JUSTIFICATIVA_REQUIRED: [400, 'A justificativa é obrigatória para o expurgo.'],
            INSUFFICIENT_STOCK: [
                409,
                'Quantidade de expurgo maior que o saldo disponível em estoque.'
            ]
        };

        if (errosConhecidos[erro.code]) {
            const [status, mensagem] = errosConhecidos[erro.code];
            return res.status(status).json({
                sucesso: false,
                mensagem,
                codigo: erro.code
            });
        }

        console.error('Erro ao registrar expurgo:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao registrar expurgo.'
        });
    }
};

module.exports = {
    excluirProduto,
    listarParaEntrada,
    registrarEntrada,
    listarParaExpurgo,
    registrarExpurgo
};