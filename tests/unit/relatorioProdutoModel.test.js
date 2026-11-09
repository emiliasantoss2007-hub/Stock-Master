jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');
const { consultarRelatorioProdutos } = require('../../src/models/relatorioProdutoModel');

describe('RF-18 - Model de relatório de produtos', () => {
    beforeEach(() => jest.clearAllMocks());

    test('retorna os campos de produto existentes no contrato e não consulta colunas sensíveis', async () => {
        const produtos = [{
            nome: 'Fonte de Alimentação',
            sku: 'sku001',
            codigo_barras: '789000000001',
            categoria: 'Componentes',
            quantidade_estoque: 10,
            marca: null
        }];
        connection.query.mockImplementation((sql, callback) => callback(null, produtos));

        await expect(consultarRelatorioProdutos()).resolves.toBe(produtos);

        const [sql] = connection.query.mock.calls[0];
        expect(sql).toContain('FROM produto p');
        expect(sql).toContain('p.nome');
        expect(sql).toContain('p.sku');
        expect(sql).toContain('p.codigo_barras');
        expect(sql).toContain('p.categoria');
        expect(sql).toContain('p.quantidade_estoque');
        expect(sql).toContain('p.marca');
        expect(produtos[0].marca).toBeNull();
        expect(sql).not.toMatch(/senha|token|email/i);
        expect(connection.query).toHaveBeenCalledTimes(1);
    });

    test('retorna lista vazia quando não há produtos', async () => {
        connection.query.mockImplementation((sql, callback) => callback(null, []));

        await expect(consultarRelatorioProdutos()).resolves.toEqual([]);
    });

    test('propaga erros de consulta sem mascarar a falha', async () => {
        const erroBanco = Object.assign(new Error('Connection lost'), {
            code: 'PROTOCOL_CONNECTION_LOST'
        });
        connection.query.mockImplementation((sql, callback) => callback(erroBanco));

        await expect(consultarRelatorioProdutos()).rejects.toBe(erroBanco);
    });
});
