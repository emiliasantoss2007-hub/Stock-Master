
// Simula o Model de relatório de produtos
jest.mock('../../src/models/relatorioProdutoModel', () => ({
    consultarRelatorioProdutos: jest.fn()
}));

// Importa o Model simulado
const relatorioProdutoModel = require('../../src/models/relatorioProdutoModel');

// Importa o Controller que será testado
const { gerarRelatorioProdutos } = require('../../src/controllers/relatorioProdutoController');

describe('Geração do Relatório de Produtos - Controller', () => {

    // TESTE 1
    it('deve consultar os produtos e retornar os resultados', async () => {

        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const produtos = [
            {
                nome: 'Fonte de Alimentação',
                sku: 'sku001',
                codigo_barras: '789000000001',
                categoria: 'Componentes',
                quantidade_estoque: 10
            }
        ];

        relatorioProdutoModel.consultarRelatorioProdutos.mockResolvedValue(produtos);

        await gerarRelatorioProdutos(req, res);

        expect(relatorioProdutoModel.consultarRelatorioProdutos).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(produtos);
    });

    // TESTE 2
    it('deve retornar uma lista vazia quando não houver produtos', async () => {

        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        relatorioProdutoModel.consultarRelatorioProdutos.mockResolvedValue([]);

        await gerarRelatorioProdutos(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    // TESTE 3
    it('deve retornar somente os campos previstos no relatório', async () => {

        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const produtos = [
            {
                nome: 'Tela 123',
                sku: 'TESTE-RF08-002',
                codigo_barras: null,
                categoria: 'Telas',
                quantidade_estoque: 13,
                campo_extra: 'Não deve aparecer'
            }
        ];

        const resultadoEsperado = [
            {
                nome: 'Tela 123',
                sku: 'TESTE-RF08-002',
                codigo_barras: null,
                categoria: 'Telas',
                quantidade_estoque: 13
            }
        ];

        relatorioProdutoModel.consultarRelatorioProdutos.mockResolvedValue(produtos);

        await gerarRelatorioProdutos(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(resultadoEsperado);
    });

    // TESTE 4
    it('deve retornar erro 500 quando ocorrer uma falha interna', async () => {

        const req = {};

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const erro = new Error('Erro de conexão com o banco de dados.');

        relatorioProdutoModel.consultarRelatorioProdutos.mockRejectedValue(erro);

        await gerarRelatorioProdutos(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro interno ao gerar relatório de produtos.'
        });
    });

});
