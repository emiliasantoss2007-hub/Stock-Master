
jest.mock('../../src/models/produtoModel', () => ({
    buscarPorId: jest.fn(),
    verificarSaldo: jest.fn(),
    verificarMovimentacoes: jest.fn(),
    excluir: jest.fn()
}));

const produtoModel = require('../../src/models/produtoModel');
const { excluirProduto } = require('../../src/controllers/produtoController');

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('RF-10 - Controller de Exclusão de Produto', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Primeiro Teste: Verificar se o usuário é administrador
    test('bloqueia a exclusão quando o usuário não é administrador', async () => {
        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 2 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Apenas administradores podem excluir produtos.'
        });
        expect(produtoModel.buscarPorId).not.toHaveBeenCalled();
    });

    // Segundo Teste: Validar o ID do produto
    test('rejeita um ID inválido', async () => {
        const req = {
            params: { id: 'abc' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'ID do produto inválido.'
        });
        expect(produtoModel.buscarPorId).not.toHaveBeenCalled();
    });

    // Terceiro Teste: Verificar se o produto existe
    test('retorna 404 quando o produto não existe', async () => {
        produtoModel.buscarPorId.mockResolvedValue(null);

        const req = {
            params: { id: '99' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.buscarPorId).toHaveBeenCalledWith(99);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Produto não encontrado.'
        });
        expect(produtoModel.verificarSaldo).not.toHaveBeenCalled();
        expect(produtoModel.excluir).not.toHaveBeenCalled();
    });

    // Quarto Teste: Verificar se existe saldo em estoque
    test('impede a exclusão quando o produto possui saldo em estoque', async () => {
        produtoModel.buscarPorId.mockResolvedValue({ id_produto: 1 });
        produtoModel.verificarSaldo.mockResolvedValue(5);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.verificarSaldo).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não é possível excluir um produto com saldo em estoque.'
        });
        expect(produtoModel.verificarMovimentacoes).not.toHaveBeenCalled();
        expect(produtoModel.excluir).not.toHaveBeenCalled();
    });

    // Quinto Teste: Verificar se existem movimentações registradas
    test('impede a exclusão quando o produto possui movimentações', async () => {
        produtoModel.buscarPorId.mockResolvedValue({ id_produto: 1 });
        produtoModel.verificarSaldo.mockResolvedValue(0);
        produtoModel.verificarMovimentacoes.mockResolvedValue(2);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.verificarMovimentacoes).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não é possível excluir um produto com movimentações registradas.'
        });
        expect(produtoModel.excluir).not.toHaveBeenCalled();
    });

    // Sexto Teste: Verificar se a exclusão foi realizada pelo Model
    test('retorna 409 quando o Model não realiza a exclusão', async () => {
        produtoModel.buscarPorId.mockResolvedValue({ id_produto: 1 });
        produtoModel.verificarSaldo.mockResolvedValue(0);
        produtoModel.verificarMovimentacoes.mockResolvedValue(0);
        produtoModel.excluir.mockResolvedValue(false);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluir).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não foi possível excluir o produto.'
        });
    });

    // Sétimo Teste: Excluir produto sem saldo e sem movimentações
    test('exclui o produto com sucesso', async () => {
        produtoModel.buscarPorId.mockResolvedValue({ id_produto: 1 });
        produtoModel.verificarSaldo.mockResolvedValue(0);
        produtoModel.verificarMovimentacoes.mockResolvedValue(0);
        produtoModel.excluir.mockResolvedValue(true);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.buscarPorId).toHaveBeenCalledWith(1);
        expect(produtoModel.verificarSaldo).toHaveBeenCalledWith(1);
        expect(produtoModel.verificarMovimentacoes).toHaveBeenCalledWith(1);
        expect(produtoModel.excluir).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            mensagem: 'Produto excluído com sucesso.',
            idProduto: 1,
            operacao: 'exclusao'
        });
    });

    // Oitavo Teste: Tratar produto vinculado a outras informações
    test('retorna 409 quando o produto possui vínculos com outras informações', async () => {
        produtoModel.buscarPorId.mockResolvedValue({ id_produto: 1 });
        produtoModel.verificarSaldo.mockResolvedValue(0);
        produtoModel.verificarMovimentacoes.mockResolvedValue(0);

        const erro = Object.assign(new Error('Produto vinculado'), {
            code: 'ER_ROW_IS_REFERENCED_2'
        });
        produtoModel.excluir.mockRejectedValue(erro);

        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não é possível excluir um produto vinculado a outras informações.'
        });

        logErro.mockRestore();
    });

    // Nono Teste: Tratar erros inesperados durante a exclusão
    test('retorna 500 quando ocorre um erro inesperado', async () => {
        const erro = new Error('Falha na conexão');
        produtoModel.buscarPorId.mockRejectedValue(erro);

        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Erro interno ao excluir produto.'
        });

        logErro.mockRestore();
    });
});
