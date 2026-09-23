jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

jest.mock('../../src/models/usuarioModel');

const usuarioModel = require('../../src/models/usuarioModel');
const { cadastrarUsuario } = require('../../src/controllers/usuarioController');

describe('RF-04 - Cadastrar Usuário', () => {

    test('deve retornar erro quando o nome não for informado', async () => {

        const req = {
            body: {
                email: 'teste@email.com',
                login: 'teste',
                senha: '123456',
                perfil: 'Técnico'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await cadastrarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Nome é obrigatório'
        });
    });

});

test('deve retornar erro quando o email não for informado', async () => {

    const req = {
        body: {
            nome: 'Usuário Teste',
            login: 'teste',
            senha: '123456',
            perfil: 'Técnico'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        message: 'Email é obrigatório'
    });
});

test('deve retornar erro quando o login não for informado', async () => {

    const req = {
        body: {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            senha: '123456',
            perfil: 'Técnico'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        message: 'Login é obrigatório'
    });
});

test('deve retornar erro quando a senha não for informada', async () => {

    const req = {
        body: {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            perfil: 'Técnico'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        message: 'Senha é obrigatória'
    });
});

test('deve retornar erro quando o perfil não for informado', async () => {

    const req = {
        body: {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            senha: '123456'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        message: 'Perfil é obrigatório'
    });
});

test('deve retornar erro quando o perfil for inválido', async () => {

    const req = {
        body: {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            senha: '123456',
            perfil: 'Gerente'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrarUsuario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        message: 'Perfil inválido'
    });
});

test('deve cadastrar usuário quando os dados forem válidos', async () => {

    usuarioModel.cadastrarUsuario.mockImplementation((dados, callback) => {
        callback(null, {
            insertId: 1
        });
    });

    const req = {
        body: {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            senha: '123456',
            perfil: 'Técnico'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await cadastrarUsuario(req, res);

    expect(usuarioModel.cadastrarUsuario).toHaveBeenCalledWith(
        {
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            senha: '123456',
            perfil: 'Técnico'
        },
        expect.any(Function)
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
        message: 'Usuário cadastrado com sucesso.',
        id_usuario: 1
    });
});