const ProdutoModel = require('../models/produtoModel');

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

module.exports = {
  excluirProduto
  // + outras funções que já existirem neste arquivo
};