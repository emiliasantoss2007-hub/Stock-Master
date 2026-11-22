
jest.mock('../../src/models/produtoModel', () => ({
    listarParaEntrada: jest.fn(),
    registrarEntrada: jest.fn()
}));

const produtoModel = require('../../src/models/produtoModel');

const {
    listarParaEntrada,
    registrarEntrada
} = require('../../src/controllers/produtoController');

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('RF-12 - Controller de Entrada de Estoque', () => {
    beforeEach(() => jest.clearAllMocks());

    test('deve listar os produtos disponíveis para entrada', async () => {
        const produtos = [{ id_produto: 1, nome: 'Tela' }];
        produtoModel.listarParaEntrada.mockResolvedValue(produtos);

        const res = criarResposta();

        await listarParaEntrada({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            produtos
        });
    });

    test('deve retornar erro ao falhar na listagem', async () => {
        produtoModel.listarParaEntrada.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = criarResposta();

        await listarParaEntrada({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(logErro).toHaveBeenCalled();
        logErro.mockRestore();
    });

    test('deve rejeitar registro sem usuário autenticado', async () => {
        const res = criarResposta();

        await registrarEntrada({ body: {}, usuario: null }, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(produtoModel.registrarEntrada).not.toHaveBeenCalled();
    });

    test('deve registrar a entrada com os dados do usuário autenticado', async () => {
        const dados = { id_produto: 7, quantidade: 5 };
        const usuario = { id_usuario: 3 };
        const resultado = { saldoAnterior: 10, saldoNovo: 15 };

        produtoModel.registrarEntrada.mockResolvedValue(resultado);

        const res = criarResposta();

        await registrarEntrada({ body: dados, usuario }, res);

        expect(produtoModel.registrarEntrada).toHaveBeenCalledWith(7, 5, 3);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            mensagem: 'Entrada de estoque registrada com sucesso.',
            dados: resultado
        });
    });

    test.each([
        ['PRODUCT_ID_INVALID', 400],
        ['QUANTITY_INVALID', 400],
        ['USER_ID_INVALID', 401],
        ['PRODUCT_NOT_FOUND', 404]
    ])('deve tratar o erro %s', async (codigo, status) => {
        produtoModel.registrarEntrada.mockRejectedValue(
            Object.assign(new Error('Erro de validação'), { code: codigo })
        );

        const res = criarResposta();

        await registrarEntrada({
            body: { id_produto: 7, quantidade: 5 },
            usuario: { id_usuario: 3 }
        }, res);

        expect(res.status).toHaveBeenCalledWith(status);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ sucesso: false })
        );
    });

    test('deve retornar erro interno quando ocorrer uma falha inesperada', async () => {
        produtoModel.registrarEntrada.mockRejectedValue(
            new Error('Erro de conexão')
        );

        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});
        const res = criarResposta();

        await registrarEntrada({
            body: { id_produto: 7, quantidade: 5 },
            usuario: { id_usuario: 3 }
        }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(logErro).toHaveBeenCalled();
        logErro.mockRestore();
    });
});
