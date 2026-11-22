
jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');
const produtoModel = require('../../src/models/produtoModel');

describe('RF-17 - Model de relatório de estoque', () => {
    beforeEach(() => jest.clearAllMocks());

    test('retorna produtos e calcula corretamente o resumo', async () => {
        const produtos = [
            {
                id_produto: 1,
                sku: 'SKU001',
                nome: 'Fonte',
                categoria: 'Componentes',
                quantidade_estoque: 10,
                valor: 150,
                valor_estoque: 1500
            }
        ];

        connection.query.mockImplementation((sql, parametros, callback) => {
            callback(null, produtos);
        });

        const resultado = await produtoModel.listarRelatorioEstoque();

        expect(resultado.itens).toHaveLength(1);
        expect(resultado.resumo).toEqual({
            totalProdutos: 1,
            totalUnidades: 10,
            valorTotalEstoque: 1500,
            produtosZerados: 0
        });

        expect(resultado.itens[0].nome).toBe('Fonte');
        expect(connection.query).toHaveBeenCalledTimes(1);
    });

    test('aplica os filtros de busca, categoria e estoque zerado', async () => {
        connection.query.mockImplementation((sql, parametros, callback) => {
            callback(null, []);
        });

        await produtoModel.listarRelatorioEstoque({
            busca: 'Tela',
            categoria: 'Telas',
            apenasZerados: true
        });

        const [sql, parametros] = connection.query.mock.calls[0];

        expect(sql).toContain('nome LIKE ? OR sku LIKE ?');
        expect(sql).toContain('categoria = ?');
        expect(sql).toContain('quantidade_estoque = 0');

        expect(parametros).toEqual([
            '%Tela%',
            '%Tela%',
            'Telas'
        ]);
    });

    test('retorna resumo zerado quando não existem produtos', async () => {
        connection.query.mockImplementation((sql, parametros, callback) => {
            callback(null, []);
        });

        const resultado = await produtoModel.listarRelatorioEstoque();

        expect(resultado.itens).toEqual([]);
        expect(resultado.resumo).toEqual({
            totalProdutos: 0,
            totalUnidades: 0,
            valorTotalEstoque: 0,
            produtosZerados: 0
        });
    });

    test('propaga erros da consulta ao banco de dados', async () => {
        const erroBanco = new Error('Connection lost');

        connection.query.mockImplementation((sql, parametros, callback) => {
            callback(erroBanco);
        });

        await expect(
            produtoModel.listarRelatorioEstoque()
        ).rejects.toBe(erroBanco);
    });
});
