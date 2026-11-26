
jest.mock('../../src/models/usuarioModel', () => ({
    listar: jest.fn()
}));

const usuarioModel = require('../../src/models/usuarioModel');

const {
    listarUsuarios
} = require('../../src/controllers/usuarioController');

const usuarioAdmin = {
    id_usuario: 1,
    id_nivel_acesso: 1
};

const usuarioTecnico = {
    id_usuario: 2,
    id_nivel_acesso: 2
};

const usuariosTeste = [
    {
        id_usuario: 1,
        nome: 'Ana Souza',
        email: 'ana@email.com',
        login: 'ana',
        perfil: 'Administrador',
        status: 1
    },
    {
        id_usuario: 2,
        nome: 'Carlos Lima',
        email: 'carlos@email.com',
        login: 'carlos',
        perfil: 'Técnico',
        status: 1
    }
];

const criarResposta = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

describe('RF - Consulta geral de usuários', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET - Listar usuários', () => {

        test('deve retornar todos os usuários para administrador', async () => {
            usuarioModel.listar.mockResolvedValue(usuariosTeste);

            const req = {
                usuario: usuarioAdmin,
                query: {}
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(usuarioModel.listar).toHaveBeenCalledWith({
                busca: '',
                perfil: '',
                status: '',
                ordenarPor: 'nome',
                direcao: 'asc'
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                sucesso: true,
                total: 2,
                filtrosAplicados: {
                    busca: '',
                    perfil: '',
                    status: '',
                    ordenarPor: 'nome',
                    direcao: 'asc'
                },
                usuarios: usuariosTeste
            });
        });

        test('deve aplicar os filtros recebidos na consulta', async () => {
            usuarioModel.listar.mockResolvedValue([usuariosTeste[1]]);

            const req = {
                usuario: usuarioAdmin,
                query: {
                    busca: ' Carlos ',
                    perfil: ' Técnico ',
                    status: 'Ativo',
                    ordenarPor: 'email',
                    direcao: 'DESC'
                }
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(usuarioModel.listar).toHaveBeenCalledWith({
                busca: 'Carlos',
                perfil: 'Técnico',
                status: 'Ativo',
                ordenarPor: 'email',
                direcao: 'desc'
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sucesso: true,
                    total: 1,
                    usuarios: [usuariosTeste[1]]
                })
            );
        });

        test('deve retornar lista vazia quando nenhum usuário for encontrado', async () => {
            usuarioModel.listar.mockResolvedValue([]);

            const req = {
                usuario: usuarioAdmin,
                query: {
                    busca: 'UsuarioInexistente'
                }
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    sucesso: true,
                    total: 0,
                    usuarios: []
                })
            );
        });

        test('deve retornar 403 para usuário sem permissão', async () => {
            const req = {
                usuario: usuarioTecnico,
                query: {}
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(usuarioModel.listar).not.toHaveBeenCalled();
        });

        test('deve retornar 403 quando não houver usuário autenticado', async () => {
            const req = {
                query: {}
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(usuarioModel.listar).not.toHaveBeenCalled();
        });

        test('deve retornar 400 quando o filtro de status for inválido', async () => {
            const req = {
                usuario: usuarioAdmin,
                query: {
                    status: 'Pendente'
                }
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(usuarioModel.listar).not.toHaveBeenCalled();
        });

        test('deve utilizar ordenação padrão quando os parâmetros forem inválidos', async () => {
            usuarioModel.listar.mockResolvedValue(usuariosTeste);

            const req = {
                usuario: usuarioAdmin,
                query: {
                    ordenarPor: 'campoInexistente',
                    direcao: 'aleatoria'
                }
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(usuarioModel.listar).toHaveBeenCalledWith({
                busca: '',
                perfil: '',
                status: '',
                ordenarPor: 'nome',
                direcao: 'asc'
            });

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('deve retornar 500 quando ocorrer erro na consulta', async () => {
            usuarioModel.listar.mockRejectedValue(
                new Error('Erro de conexão com o banco de dados')
            );

            const req = {
                usuario: usuarioAdmin,
                query: {}
            };

            const res = criarResposta();

            await listarUsuarios(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                sucesso: false,
                mensagem: 'Erro ao consultar usuários.',
                usuarios: []
            });
        });
    });
});