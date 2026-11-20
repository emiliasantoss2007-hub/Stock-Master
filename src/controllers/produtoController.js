const ProdutoModel = require('../models/produtoModel');

// RF-01 — Cadastrar Produto
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

    ProdutoModel.cadastrarProduto(dadosParaModel, (erro, resultado) => {
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

// RF-10 — Excluir Produto
const excluirProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;

    // 1. Administrador validado (RNF-10.01 / mesmo critério do RF-06)
    if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas administradores podem excluir produtos.'
      });
    }

    // 2. Validar id
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Identificador de produto inválido.'
      });
    }

    // 3. Produto identificado
    const produto = await ProdutoModel.buscarPorId(id);

    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Produto não encontrado.'
      });
    }

    // 4. Saldo verificado — não exclui com estoque
    const saldo = await ProdutoModel.verificarSaldo(id);

    if (saldo === null) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Produto não encontrado.'
      });
    }

    if (saldo > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Não é possível excluir o produto enquanto houver saldo em estoque.'
      });
    }

    // 5. Movimentações verificadas
    const totalMov = await ProdutoModel.verificarMovimentacoes(id);

    if (totalMov > 0) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'O produto possui movimentações e não pode ser excluído.'
      });
    }

    // 6. Model acionado — exclusão física (sem estoque e sem movimentações)
    const excluido = await ProdutoModel.excluir(id);

    if (!excluido) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Não foi possível excluir o produto.'
      });
    }

    // 7. Retorno implementado
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Produto excluído com sucesso.',
      idProduto: Number(id),
      operacao: 'exclusao'
    });
  } catch (error) {
    console.error('Erro no RF-10 (excluir produto):', error);

    if (
      error.code === 'ER_ROW_IS_REFERENCED_2' ||
      error.code === 'ER_ROW_IS_REFERENCED'
    ) {
      return res.status(409).json({
        sucesso: false,
        mensagem:
          'O produto possui registros relacionados e não pode ser excluído. Considere inativá-lo.'
      });
    }

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

// RF-17 — RELATÓRIO DE ESTOQUE (com filtros)
const relatorioEstoque = async (req, res) => {
  try {
    const usuarioLogado = req.usuario;

    if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem:
          'Acesso negado. Apenas administradores podem gerar relatórios de estoque.'
      });
    }

    // 1. Filtros recebidos (query string)
    const { busca, categoria, apenasZerados } = req.query;

    const filtros = {
      busca,
      categoria,
      apenasZerados
    };

    // 2. Consulta acionada
    const inicio = Date.now();
    const relatorio = await ProdutoModel.listarRelatorioEstoque(filtros);
    const tempoMs = Date.now() - inicio;

    // 3. Dados tratados + retorno implementado
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Relatório de estoque gerado com sucesso.',
      desempenho: {
        tempoMs
      },
      dados: relatorio
    });
  } catch (erro) {
    console.error('Erro no RF-17 (relatório de estoque):', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao gerar relatório de estoque.'
    });
  }
};

// RF-20 — EXPORTAR RELATÓRIO DE ESTOQUE EM PDF
const exportarRelatorioEstoquePdf = async (req, res) => {
  try {
    const usuarioLogado = req.usuario;

    if (!usuarioLogado || Number(usuarioLogado.id_nivel_acesso) !== 1) {
      return res.status(403).json({
        sucesso: false,
        mensagem:
          'Acesso negado. Apenas administradores podem exportar relatórios em PDF.'
      });
    }

    const { busca, categoria, apenasZerados } = req.query;
    const filtros = { busca, categoria, apenasZerados };

    const pdfBuffer = await ProdutoModel.gerarRelatorioEstoquePdf(filtros);

    const dataArquivo = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `relatorio-estoque-${dataArquivo}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nomeArquivo}"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (erro) {
    console.error('Erro no RF-20 (exportar PDF):', erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao gerar o relatório em PDF.'
    });
  }
};

module.exports = {
  cadastrarProduto,
  excluirProduto,
  listarParaEntrada,
  registrarEntrada,
  listarParaExpurgo,
  registrarExpurgo,
  relatorioEstoque,
  exportarRelatorioEstoquePdf
};
