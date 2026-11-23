
jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');
const { excluir } = require('../../src/models/usuarioModel');

describe('RF - Model de Exclusão de Usuários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve excluir usuário existente com sucesso', async () => {

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, { affectedRows: 1 });
        });

        const resultado = await excluir(5);

        expect(connection.query).toHaveBeenCalledTimes(1);

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('DELETE FROM usuario');
        expect(sql).toContain('WHERE id_usuario = ?');
        expect(valores).toEqual([5]);

        expect(resultado).toBe(true);
    });

    test('deve retornar false quando nenhum usuário for excluído', async () => {

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, { affectedRows: 0 });
        });

        const resultado = await excluir(99);

        expect(resultado).toBe(false);
    });

    test('deve rejeitar quando ocorrer erro no banco de dados', async () => {

        const erro = new Error('Erro ao executar DELETE');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erro);
        });

        await expect(excluir(5)).rejects.toThrow(
            'Erro ao executar DELETE'
        );
    });

    test('deve utilizar parâmetro para evitar SQL Injection', async () => {

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, { affectedRows: 1 });
        });

        await excluir('5 OR 1=1');

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('WHERE id_usuario = ?');
        expect(valores).toEqual(['5 OR 1=1']);
        expect(sql).not.toContain('5 OR 1=1');
    });

});