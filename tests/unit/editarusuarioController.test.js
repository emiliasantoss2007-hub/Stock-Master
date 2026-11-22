jest.mock('../../src/models/usuarioModel', () => ({
    buscarPorId: jest.fn(),
    verificarLogin: jest.fn(),
    verificarEmail: jest.fn(),
    atualizar: jest.fn()
}));

const usuarioModel = require('../../src/models/usuarioModel');

const {
    buscarUsuarioPorId,
    editarUsuario
} = require('../../src/controllers/usuarioController');

const usuarioAdmin = {
    id_usuario: 1,
    id_nivel_acesso: 1
};

const usuarioTeste = {
    id_usuario: 2,
    nome: 'Usuario Teste',
    email: 'teste@email.com',
    login: 'teste',
    id_nivel_acesso: 2
};

const criarResposta = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('RF-05 - Edicao de Usuario', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET - Buscar usuario por ID', () => {

        test('deve retornar usuario quando encontrado', async () => {
            usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);

            const req = {
                params: { id: '2' },
                usuario: usuarioAdmin
            };

            const res = criarResposta();

            await buscarUsuarioPorId(req, res);

            expect(usuarioModel.buscarPorId).toHaveBeenCalledWith('2');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(usuarioTeste);
        });

        test('deve retornar 404 quando usuario nao existir', async () => {
            usuarioModel.buscarPorId.mockResolvedValue(null);

            const req = {
                params: { id: '99' },
                usuario: usuarioAdmin
            };

            const res = criarResposta();

            await buscarUsuarioPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('deve retornar 403 para usuario sem permissao', async () => {
            const req = {
                params: { id: '2' },
                usuario: {
                    id_usuario: 3,
                    id_nivel_acesso: 2
                }
            };

            const res = criarResposta();

            await buscarUsuarioPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(usuarioModel.buscarPorId).not.toHaveBeenCalled();
        });

        test('deve retornar 400 para ID invalido', async () => {
            const req = {
                params: { id: 'abc' },
                usuario: usuarioAdmin
            };

            const res = criarResposta();

            await buscarUsuarioPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('PUT - Editar usuario', () => {

        test('deve atualizar usuario com dados validos', async () => {
            usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);
            usuarioModel.verificarLogin.mockResolvedValue(false);
            usuarioModel.verificarEmail.mockResolvedValue(false);
            usuarioModel.atualizar.mockResolvedValue(true);

            const req = {
                params: { id: '2' },
                usuario: usuarioAdmin,
                body: {
                    nome: 'Nome Atualizado',
                    email: 'novo@email.com',
                    login: 'novo.login',
                    id_nivel_acesso: 2
                }
            };

            const res = criarResposta();

            await editarUsuario(req, res);

            expect(usuarioModel.atualizar).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sucesso: true,
                    dadosAtualizados: expect.objectContaining({
                        nome: 'Nome Atualizado',
                        email: 'novo@email.com'
                    })
                })
            );
        });

        test('deve retornar 403 para usuario sem permissao', async () => {
            const req = {
                params: { id: '2' },
                usuario: {
                    id_usuario: 3,
                    id_nivel_acesso: 2
                },
                body: {}
            };

            const res = criarResposta();

            await editarUsuario(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('deve retornar 400 quando faltarem campos obrigatorios', async () => {
            const req = {
                params: { id: '2' },
                usuario: usuarioAdmin,
                body: {
                    nome: 'Usuario Teste'
                }
            };

            const res = criarResposta();

            await editarUsuario(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('deve retornar 404 quando usuario nao existir', async () => {
            usuarioModel.buscarPorId.mockResolvedValue(null);

            const req = {
                params: { id: '99' },
                usuario: usuarioAdmin,
                body: {
                    nome: 'Usuario Teste',
                    email: 'teste@email.com',
                    login: 'teste',
                    id_nivel_acesso: 2
                }
            };

            const res = criarResposta();

            await editarUsuario(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('deve retornar 409 quando login ja estiver em uso', async () => {
            usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);
            usuarioModel.verificarLogin.mockResolvedValue(true);

            const req = {
                params: { id: '2' },
                usuario: usuarioAdmin,
                body: {
                    nome: 'Usuario Teste',
                    email: 'teste@email.com',
                    login: 'outro.login',
                    id_nivel_acesso: 2
                }
            };

            const res = criarResposta();

            await editarUsuario(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('deve retornar 409 quando email ja estiver em uso', async () => {
            usuarioModel.buscarPorId.mockResolvedValue(usuarioTeste);
            usuarioModel.verificarLogin.mockResolvedValue(false);
            usuarioModel.verificarEmail.mockResolvedValue(true);

            const req = {
                params: { id: '2' },
                usuario: usuarioAdmin,
                body: {
                    nome: 'Usuario Teste',
                    email: 'outro@email.com',
                    login: 'teste',
                    id_nivel_acesso: 2
                }
            };

            const res = criarResposta();

            await editarUsuario(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
