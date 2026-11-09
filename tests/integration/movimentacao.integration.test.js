
// Simula somente a conexão com o banco de dados
jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const express = require('express');
const connection = require('../../src/config/database');
const movimentacaoRoutes = require('../../src/routes/movimentacaoRoutes');

const app = express();

app.use(express.json());
app.use('/api', movimentacaoRoutes);

let server;
let baseUrl;

// Inicia um servidor temporário para os testes
beforeAll(async () => {
    server = app.listen(0);

    await new Promise(resolve => {
        server.once('listening', resolve);
    });

    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
});

// Encerra o servidor temporário
afterAll(async () => {
    await new Promise((resolve, reject) => {
        server.close(erro => {
            if (erro) return reject(erro);
            resolve();
        });
    });
});

// Limpa as chamadas anteriores ao banco
beforeEach(() => {
    connection.query.mockReset();
});

describe('Integração - RF-14 Consulta do Histórico de Estoque', () => {

    it('deve receber a requisição, consultar o Model e retornar o histórico', async () => {

        const registros = [
            {
                id_movimentacao: 1,
                id_produto: 5,
                nome_produto: 'Fonte de Alimentação',
                sku_produto: 'SKU001',
                id_usuario: 1,
                nome_responsavel: 'Teste',
                login_responsavel: 'teste1',
                tipo_movimentacao: 'ENTRADA',
                quantidade: 10,
                data_movimentacao: '2026-11-07T10:00:00.000Z',
                justificativa: 'Entrada de teste'
            }
        ];

        // Simula o retorno do banco de dados
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, registros);
        });

        // Envia uma requisição HTTP com os filtros
        const resposta = await fetch(
            `${baseUrl}/api/historico?id_produto=5&data_inicio=2026-11-01&data_fim=2026-11-07&tipo_movimentacao=ENTRADA`
        );

        const resultado = await resposta.json();

        // Verifica a resposta da API
        expect(resposta.status).toBe(200);
        expect(resultado).toEqual(registros);

        // Verifica se o Model consultou o banco com os filtros
        expect(connection.query).toHaveBeenCalledTimes(1);

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('FROM movimentacao m');
        expect(sql).toContain('INNER JOIN produto');
        expect(sql).toContain('INNER JOIN usuario');

        expect(valores).toEqual([
            5,
            '2026-11-01 00:00:00',
            '2026-11-07',
            'ENTRADA'
        ]);
    });

    it('deve retornar erro 400 quando o filtro for inválido', async () => {

        const resposta = await fetch(
            `${baseUrl}/api/historico?id_produto=abc`
        );

        const resultado = await resposta.json();

        expect(resposta.status).toBe(400);

        expect(resultado).toEqual({
            message: 'id_produto deve ser um inteiro positivo.'
        });

        // Não deve consultar o banco com filtro inválido
        expect(connection.query).not.toHaveBeenCalled();
    });

    it('deve retornar uma lista vazia quando não houver movimentações', async () => {

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        const resposta = await fetch(
            `${baseUrl}/api/historico`
        );

        const resultado = await resposta.json();

        expect(resposta.status).toBe(200);
        expect(resultado).toEqual([]);

        expect(connection.query).toHaveBeenCalledTimes(1);
    });

});
