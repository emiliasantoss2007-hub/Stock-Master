
jest.mock('../../src/models/produtoModel', () => ({
    excluirComVerificacao: jest.fn()
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

    // 1. Verificar permissão de administrador
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

        expect(produtoModel.excluirComVerificacao).not.toHaveBeenCalled();
    });

    // 2. Validar ID do produto
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

        expect(produtoModel.excluirComVerificacao).not.toHaveBeenCalled();
    });

    // 3. Produto inexistente
    test('retorna 404 quando o produto não existe', async () => {
        const erro = Object.assign(new Error('Produto não encontrado.'), {
            code: 'PRODUCT_NOT_FOUND'
        });

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

        const req = {
            params: { id: '99' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluirComVerificacao).toHaveBeenCalledWith(99);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Produto não encontrado.'
        });
    });

    // 4. Produto com saldo positivo
    test('impede a exclusão quando o produto possui saldo positivo', async () => {
        const erro = Object.assign(new Error('Produto possui saldo.'), {
            code: 'PRODUCT_HAS_STOCK'
        });

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluirComVerificacao).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não é possível excluir um produto com saldo em estoque.'
        });
    });

    // 5. Produto com saldo negativo
    test('impede a exclusão quando o produto possui saldo negativo', async () => {
        const erro = Object.assign(new Error('Produto possui saldo.'), {
            code: 'PRODUCT_HAS_STOCK'
        });

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluirComVerificacao).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não é possível excluir um produto com saldo em estoque.'
        });
    });

    // 6. Produto com movimentações
    test('impede a exclusão quando o produto possui movimentações', async () => {
        const erro = Object.assign(new Error('Produto possui movimentações.'), {
            code: 'PRODUCT_HAS_MOVEMENTS'
        });

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluirComVerificacao).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Não é possível excluir um produto com movimentações registradas.'
        });
    });

    // 7. Exclusão não confirmada
    test('retorna 409 quando o Model não confirma a exclusão', async () => {
        const erro = Object.assign(new Error('Exclusão não confirmada.'), {
            code: 'PRODUCT_DELETE_NOT_CONFIRMED'
        });

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluirComVerificacao).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(409);
    });

    // 8. Exclusão realizada com sucesso
    test('exclui o produto com sucesso', async () => {
        produtoModel.excluirComVerificacao.mockResolvedValue(true);

        const req = {
            params: { id: '1' },
            usuario: { id_nivel_acesso: 1 }
        };
        const res = criarResposta();

        await excluirProduto(req, res);

        expect(produtoModel.excluirComVerificacao).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            mensagem: 'Produto excluído com sucesso.',
            idProduto: 1,
            operacao: 'exclusao'
        });
    });

    // 9. Produto vinculado a outras informações
    test('retorna 409 quando o produto possui vínculos com outras informações', async () => {
        const erro = Object.assign(new Error('Produto vinculado.'), {
            code: 'ER_ROW_IS_REFERENCED_2'
        });

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

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
            mensagem: 'Não foi possível excluir o produto ou ele está vinculado a outras informações.'
        });

        logErro.mockRestore();
    });

    // 10. Erro inesperado
    test('retorna 500 quando ocorre um erro inesperado', async () => {
        const erro = new Error('Falha na conexão');

        produtoModel.excluirComVerificacao.mockRejectedValue(erro);

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