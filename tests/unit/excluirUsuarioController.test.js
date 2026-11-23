
jest.mock('../../src/models/usuarioModel', () => ({
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    excluir: jest.fn()
}));

const usuarioModel = require('../../src/models/usuarioModel');

const {
    excluirUsuario
} = require('../../src/controllers/usuarioController');

const usuarioAdmin = {
    id_usuario: 1,
    id_nivel_acesso: 1
};

const usuarioTecnico = {
    id_usuario: 2,
    id_nivel_acesso: 2
};

const usuarioTeste = {
    id_usuario: 5,
    nome: 'Carlos Lima',
    email: 'carlos@email.com'
};

const criarResposta = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('RF - Exclusão de usuários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve excluir usuário com sucesso para administrador', async () => {

        usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);
        usuarioModel.excluir.mockResolvedValue(true);

        const req = {
            params: { id: '5' },
            usuario: usuarioAdmin
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(usuarioModel.buscarPorId).toHaveBeenCalledWith('5');
        expect(usuarioModel.excluir).toHaveBeenCalledWith('5');

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            mensagem: 'Usuário excluído com sucesso.',
            idUsuario: 5
        });
    });

    test('não deve permitir exclusão por técnico', async () => {

        const req = {
            params: { id: '5' },
            usuario: usuarioTecnico
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(usuarioModel.buscarPorId).not.toHaveBeenCalled();
        expect(usuarioModel.excluir).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('não deve permitir exclusão sem usuário autenticado', async () => {

        const req = {
            params: { id: '5' },
            usuario: undefined
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(usuarioModel.buscarPorId).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('deve rejeitar identificador inválido', async () => {

        const req = {
            params: { id: 'abc' },
            usuario: usuarioAdmin
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(usuarioModel.buscarPorId).not.toHaveBeenCalled();
        expect(usuarioModel.excluir).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deve retornar 404 quando usuário não existir', async () => {

        usuarioModel.buscarPorId.mockResolvedValue(null);

        const req = {
            params: { id: '99' },
            usuario: usuarioAdmin
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(usuarioModel.buscarPorId).toHaveBeenCalledWith('99');
        expect(usuarioModel.excluir).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deve retornar 409 quando exclusão não afetar nenhum registro', async () => {

        usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);
        usuarioModel.excluir.mockResolvedValue(false);

        const req = {
            params: { id: '5' },
            usuario: usuarioAdmin
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(usuarioModel.excluir).toHaveBeenCalledWith('5');
        expect(res.status).toHaveBeenCalledWith(409);
    });

    test('deve retornar 409 quando houver registros relacionados', async () => {

        const erro = new Error('Registro relacionado');
        erro.code = 'ER_ROW_IS_REFERENCED_2';

        usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);
        usuarioModel.excluir.mockRejectedValue(erro);

        const req = {
            params: { id: '5' },
            usuario: usuarioAdmin
        };

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'O usuário possui registros relacionados e não pode ser excluído.'
        });
    });

});