jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

jest.mock('bcrypt');

const connection = require('../../src/config/database');
const bcrypt = require('bcrypt');
const { cadastrarUsuario } = require('../../src/models/usuarioModel');

describe('RF-04 - Model de Cadastro de Usuário', () => {
    beforeEach(() => {
    jest.clearAllMocks();
});

    test('deve retornar erro quando ocorrer erro ao buscar o nível de acesso', async () => {

        const erroBanco = new Error('Erro ao consultar nível de acesso');

        connection.query.mockImplementation((sql, valores, callback) => {
            callback(erroBanco);
        });

        const dados = {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            senha: '123456',
            perfil: 'Técnico'
        };

        const callback = jest.fn();

        cadastrarUsuario(dados, callback);

        expect(callback).toHaveBeenCalledWith(erroBanco);
    });

});

test('deve retornar erro quando o nível de acesso não for encontrado', () => {

    connection.query.mockImplementation((sql, valores, callback) => {
        callback(null, []);
    });

    const dados = {
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        login: 'teste',
        senha: '123456',
        perfil: 'Técnico'
    };

    const callback = jest.fn();

    cadastrarUsuario(dados, callback);

    expect(callback).toHaveBeenCalledWith(
        expect.any(Error)
    );

    expect(callback.mock.calls[0][0].message).toBe(
        'Nível de acesso não encontrado'
    );
});

test('deve retornar erro quando ocorrer erro ao gerar o hash da senha', () => {

    connection.query.mockImplementation((sql, valores, callback) => {
        callback(null, [{ id_nivel_acesso: 2 }]);
    });

    const erroHash = new Error('Erro ao gerar hash');

    bcrypt.hash.mockImplementation((senha, salt, callback) => {
        callback(erroHash);
    });

    const dados = {
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        login: 'teste',
        senha: '123456',
        perfil: 'Técnico'
    };

    const callback = jest.fn();

    cadastrarUsuario(dados, callback);

    expect(callback).toHaveBeenCalledWith(erroHash);
});

test('deve retornar erro quando ocorrer erro ao cadastrar o usuário', () => {

    connection.query
        .mockImplementationOnce((sql, valores, callback) => {
            callback(null, [{ id_nivel_acesso: 2 }]);
        })
        .mockImplementationOnce((sql, valores, callback) => {
            callback(new Error('Erro ao cadastrar usuário'));
        });

    bcrypt.hash.mockImplementation((senha, salt, callback) => {
        callback(null, 'hash-da-senha');
    });

    const dados = {
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        login: 'teste',
        senha: '123456',
        perfil: 'Técnico'
    };

    const callback = jest.fn();

    cadastrarUsuario(dados, callback);

    expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
            message: 'Erro ao cadastrar usuário'
        })
    );
});

test('deve cadastrar usuário quando os dados forem válidos', () => {

    connection.query
        .mockImplementationOnce((sql, valores, callback) => {
            callback(null, [{ id_nivel_acesso: 2 }]);
        })
        .mockImplementationOnce((sql, valores, callback) => {
            callback(null, {
                insertId: 1
            });
        });

    bcrypt.hash.mockImplementation((senha, salt, callback) => {
        callback(null, 'hash-da-senha');
    });

    const dados = {
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        login: 'teste',
        senha: '123456',
        perfil: 'Técnico'
    };

    const callback = jest.fn();

    cadastrarUsuario(dados, callback);

    expect(bcrypt.hash).toHaveBeenCalledWith(
        '123456',
        10,
        expect.any(Function)
    );

    expect(callback).toHaveBeenCalledWith(
        null,
        {
            insertId: 1
        }
    );
});