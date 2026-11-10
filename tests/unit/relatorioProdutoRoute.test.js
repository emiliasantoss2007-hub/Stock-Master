jest.mock('../../src/models/relatorioProdutoModel', () => ({
    consultarRelatorioProdutos: jest.fn()
}));

const express = require('express');
const relatorioProdutoModel = require('../../src/models/relatorioProdutoModel');
const relatorioProdutoRoutes = require('../../src/routes/relatorioProdutoRoutes');

describe('GET /api/relatorio/produtos', () => {
    let server;
    let endpoint;

    beforeAll(async () => {
        const app = express();
        app.use('/api', relatorioProdutoRoutes);
        server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
        });
        endpoint = `http://127.0.0.1:${server.address().port}/api/relatorio/produtos`;
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            server.close((erro) => erro ? reject(erro) : resolve());
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('chama o Model e retorna os cinco campos em JSON', async () => {
        const produtos = [{
            nome: 'Fonte de Alimentação',
            sku: 'sku001',
            codigo_barras: '789000000001',
            categoria: 'Componentes',
            quantidade_estoque: 10,
            campo_extra: 'não deve ser exposto'
        }];
        relatorioProdutoModel.consultarRelatorioProdutos.mockResolvedValue(produtos);

        const resposta = await fetch(endpoint);
        const corpo = await resposta.json();

        expect(resposta.status).toBe(200);
        expect(resposta.headers.get('content-type')).toMatch(/application\/json/);
        expect(relatorioProdutoModel.consultarRelatorioProdutos).toHaveBeenCalledTimes(1);
        expect(corpo).toEqual([{
            nome: 'Fonte de Alimentação',
            sku: 'sku001',
            codigo_barras: '789000000001',
            categoria: 'Componentes',
            quantidade_estoque: 10
        }]);
    });

    test('retorna lista vazia quando o Model não encontra produtos', async () => {
        relatorioProdutoModel.consultarRelatorioProdutos.mockResolvedValue([]);

        const resposta = await fetch(endpoint);

        expect(resposta.status).toBe(200);
        await expect(resposta.json()).resolves.toEqual([]);
        expect(relatorioProdutoModel.consultarRelatorioProdutos).toHaveBeenCalledTimes(1);
    });

    test('retorna erro genérico quando o Model falha', async () => {
        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});
        relatorioProdutoModel.consultarRelatorioProdutos.mockRejectedValue(
            new Error('detalhe interno que não deve ser exposto')
        );

        try {
            const resposta = await fetch(endpoint);

            expect(resposta.status).toBe(500);
            await expect(resposta.json()).resolves.toEqual({
                message: 'Erro interno ao gerar relatório de produtos.'
            });
        } finally {
            logErro.mockRestore();
        }
    });
});
