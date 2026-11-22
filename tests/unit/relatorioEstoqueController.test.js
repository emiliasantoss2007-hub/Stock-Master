
jest.mock('../../src/models/produtoModel', () => ({
    listarRelatorioEstoque: jest.fn()
}));

const produtoModel = require('../../src/models/produtoModel');

const {
    relatorioEstoque
} = require('../../src/controllers/produtoController');

describe('RF-17 - Controller de relatório de estoque', () => {
    beforeEach(() => jest.clearAllMocks());

    test('consulta o relatório e retorna os dados com sucesso', async () => {
        const req = {
            query: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const relatorio = {
            resumo: {
                totalProdutos: 1,
                totalUnidades: 10,
                valorTotalEstoque: 1500,
                produtosZerados: 0
            },
            itens: [{
                idProduto: 1,
                nome: 'Fonte',
                quantidadeEstoque: 10
            }]
        };

        produtoModel.listarRelatorioEstoque.mockResolvedValue(relatorio);

        await relatorioEstoque(req, res);

        expect(produtoModel.listarRelatorioEstoque).toHaveBeenCalledWith({
            busca: '',
            categoria: '',
            apenasZerados: false
        });

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                sucesso: true,
                mensagem: 'Relatório de estoque gerado com sucesso.',
                dados: relatorio
            })
        );
    });

    test('recebe e normaliza os filtros da requisição', async () => {
        const req = {
            query: {
                busca: '  Tela  ',
                categoria: '  Telas  ',
                apenasZerados: 'true'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        produtoModel.listarRelatorioEstoque.mockResolvedValue({
            resumo: {},
            itens: []
        });

        await relatorioEstoque(req, res);

        expect(produtoModel.listarRelatorioEstoque).toHaveBeenCalledWith({
            busca: 'Tela',
            categoria: 'Telas',
            apenasZerados: true
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('retorna erro 500 quando ocorre uma falha no Model', async () => {
        const req = {
            query: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        produtoModel.listarRelatorioEstoque.mockRejectedValue(
            new Error('Erro no banco de dados')
        );

        await relatorioEstoque(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Erro ao gerar relatório de estoque.'
        });
    });
});
