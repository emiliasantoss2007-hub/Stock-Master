// Simula o Model de movimentações
jest.mock('../../src/models/movimentacaoModel', () => ({
    consultarHistorico: jest.fn()
}), { virtual: true });

// Importa o Model simulado
const movimentacaoModel = require('../../src/models/movimentacaoModel');

// Importa o Controller que será testado
const { consultarHistorico } = require('../../src/controllers/movimentacaoController');

describe('Consulta do Histórico de Estoque - Controller', () => {

    // TESTE 1
    it('deve consultar o histórico e retornar os resultados', async () => {

        // Simula os filtros enviados pela URL
        const req = {
            query: {
                id_produto: '5',
                data_inicio: '2026-11-01',
                data_fim: '2026-11-07',
                tipo_movimentacao: 'ENTRADA'
            }
        };

        // Simula a resposta do Controller
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Simula os resultados retornados pelo Model
        const resultados = [
            { id_movimentacao: 1, id_produto: 5, quantidade: 10 }
        ];

        movimentacaoModel.consultarHistorico.mockResolvedValue(resultados);

        // Executa o Controller
        await consultarHistorico(req, res);

        // Verifica se o Model recebeu os filtros
        expect(movimentacaoModel.consultarHistorico).toHaveBeenCalledWith(req.query);

        // Verifica o status e os resultados retornados
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(resultados);

    });

    // TESTE 2
    it('deve retornar uma lista vazia quando não houver registros', async () => {

        const req = {
            query: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Simula o Model sem registros encontrados
        movimentacaoModel.consultarHistorico.mockResolvedValue([]);

        // Executa o Controller
        await consultarHistorico(req, res);

        // Verifica o status e a lista vazia
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);

    });

        // TESTE 3
    it('deve retornar erro 400 quando um filtro for inválido', async () => {

        const req = {
            query: {
                id_produto: 'abc'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Simula um erro de filtro inválido retornado pelo Model
        const erro = new Error('id_produto deve ser um inteiro positivo.');
        erro.code = 'INVALID_FILTER';

        movimentacaoModel.consultarHistorico.mockRejectedValue(erro);

        // Executa o Controller
        await consultarHistorico(req, res);

        // Verifica o status e a mensagem de erro
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: erro.message
        });

    });

        // TESTE 4
    it('deve retornar erro 500 quando ocorrer uma falha interna', async () => {

        const req = {
            query: {}
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Simula uma falha inesperada no Model
        const erro = new Error('Erro de conexão com o banco de dados.');

        movimentacaoModel.consultarHistorico.mockRejectedValue(erro);

        // Executa o Controller
        await consultarHistorico(req, res);

        // Verifica o status e a mensagem de erro
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erro interno ao consultar histórico de movimentações.'
        });

    });

});
