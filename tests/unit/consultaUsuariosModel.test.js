
jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');
const { listar } = require('../../src/models/usuarioModel');

describe('RF - Model de Consulta de Usuários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve listar usuários sem filtros', async () => {
        const usuarios = [
            {
                id_usuario: 1,
                nome: 'Ana Souza',
                email: 'ana@email.com',
                login: 'ana',
                perfil: 'Administrador',
                status: 1
            }
        ];

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, usuarios);
        });

        const resultado = await listar();

        expect(connection.query).toHaveBeenCalledTimes(1);
        expect(connection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [],
            expect.any(Function)
        );

        expect(resultado).toEqual(usuarios);
    });

    test('deve aplicar filtro de busca por nome, e-mail e login', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            busca: 'Carlos'
        });

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('u.nome LIKE ?');
        expect(sql).toContain('u.email LIKE ?');
        expect(sql).toContain('u.login LIKE ?');

        expect(valores).toEqual([
            '%Carlos%',
            '%Carlos%',
            '%Carlos%'
        ]);
    });

    test('deve aplicar filtro de perfil', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            perfil: 'Técnico'
        });

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('n.descricao = ?');
        expect(valores).toEqual(['Técnico']);
    });

    test('deve converter o status Ativo para 1', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            status: 'Ativo'
        });

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('u.status = ?');
        expect(valores).toEqual([1]);
    });

    test('deve converter o status Inativo para 0', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            status: 'Inativo'
        });

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('u.status = ?');
        expect(valores).toEqual([0]);
    });

    test('deve aplicar filtros combinados corretamente', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            busca: 'Ana',
            perfil: 'Administrador',
            status: 'Ativo'
        });

        const [sql, valores] = connection.query.mock.calls[0];

        expect(sql).toContain('u.nome LIKE ?');
        expect(sql).toContain('n.descricao = ?');
        expect(sql).toContain('u.status = ?');

        expect(valores).toEqual([
            '%Ana%',
            '%Ana%',
            '%Ana%',
            'Administrador',
            1
        ]);
    });

    test('deve ordenar usuários por e-mail em ordem decrescente', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            ordenarPor: 'email',
            direcao: 'desc'
        });

        const [sql] = connection.query.mock.calls[0];

        expect(sql).toContain('ORDER BY u.email DESC');
    });

    test('deve utilizar ordenação padrão para coluna inválida', async () => {
        connection.query.mockImplementation((sql, valores, callback) => {
            callback(null, []);
        });

        await listar({
            ordenarPor: 'coluna_invalida',
            direcao: 'asc'
        });

        const [sql] = connection.query.mock.calls[0];

        expect(sql).toContain('ORDER BY u.nome ASC');
    });

    test('deve retornar erro quando ocorrer falha na consulta', async () => {
        const erroBanco = new Error('Erro ao consultar usuários');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        await expect(listar()).rejects.toThrow(
            'Erro ao consultar usuários'
        );
    });

});