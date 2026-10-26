jest.mock('../../src/models/usuarioModel', () => ({
    listar: jest.fn(),
    buscarPorId: jest.fn(),
    verificarLogin: jest.fn(),
    verificarEmail: jest.fn(),
    atualizarComTransacao: jest.fn(),
    excluir: jest.fn()
}));

const usuarioModel = require('../../src/models/usuarioModel');

const {
    listarUsuarios,
    editarUsuario,
    excluirUsuario
} = require('../../src/controllers/usuarioController');

const criarResposta = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
});

beforeEach(() => {
    jest.clearAllMocks();
});

// CONSULTAR USUÁRIOS
describe('RF - Consultar usuários', () => {
    test('retorna usuários e filtros aplicados', async () => {
        const usuarios = [{
            id_usuario: 1,
            nome: 'Usuário Teste',
            email: 'teste@email.com',
            login: 'teste',
            perfil: 'Técnico',
            status: 1
        }];

        usuarioModel.listar.mockResolvedValue(usuarios);

        const req = {
            query: {
                busca: ' teste ',
                perfil: ' Técnico ',
                status: 'Ativo',
                ordenarPor: 'email',
                direcao: 'desc'
            }
        };

        const res = criarResposta();

        await listarUsuarios(req, res);

        expect(usuarioModel.listar).toHaveBeenCalledWith({
            busca: 'teste',
            perfil: 'Técnico',
            status: 'Ativo',
            ordenarPor: 'email',
            direcao: 'desc'
        });

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            total: 1,
            filtrosAplicados: {
                busca: 'teste',
                perfil: 'Técnico',
                status: 'Ativo',
                ordenarPor: 'email',
                direcao: 'desc'
            },
            usuarios
        });
    });

    test('retorna lista vazia quando nenhum usuário é encontrado', async () => {
        usuarioModel.listar.mockResolvedValue([]);

        const res = criarResposta();

        await listarUsuarios({ query: {} }, res);

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                sucesso: true,
                total: 0,
                usuarios: []
            })
        );
    });

    test('retorna erro 500 quando a consulta falha', async () => {
        usuarioModel.listar.mockRejectedValue(
            new Error('Falha no banco')
        );

        const res = criarResposta();
        const logOriginal = console.error;

        console.error = jest.fn();

        try {
            await listarUsuarios({ query: {} }, res);
        } finally {
            console.error = logOriginal;
        }

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'Erro ao consultar usuários.',
            usuarios: []
        });
    });
});

// EDITAR USUÁRIO
describe('RF - Editar usuário', () => {
    const reqValida = () => ({
        params: {
            id: '2'
        },
        body: {
            nome: ' Nome Atualizado ',
            email: ' novo@email.com ',
            login: ' novo_login ',
            id_nivel_acesso: 2
        },
        usuario: {
            id_nivel_acesso: 1
        }
    });

    test('atualiza usuário com dados válidos e solicitante administrador', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 2
        });

        usuarioModel.verificarLogin.mockResolvedValue(false);
        usuarioModel.verificarEmail.mockResolvedValue(false);

        const atualizado = {
            id_usuario: 2,
            nome: 'Nome Atualizado',
            email: 'novo@email.com',
            login: 'novo_login',
            id_nivel_acesso: 2
        };

        usuarioModel.atualizarComTransacao.mockResolvedValue(
            atualizado
        );

        const res = criarResposta();

        await editarUsuario(reqValida(), res);

        expect(usuarioModel.atualizarComTransacao)
            .toHaveBeenCalledWith(
                '2',
                'Nome Atualizado',
                'novo@email.com',
                'novo_login',
                2
            );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                sucesso: true,
                dadosAtualizados: atualizado
            })
        );
    });

    test('bloqueia edição quando o solicitante não é administrador', async () => {
        const req = reqValida();

        req.usuario.id_nivel_acesso = 2;

        const res = criarResposta();

        await editarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(usuarioModel.buscarPorId)
            .not.toHaveBeenCalled();
    });

    test('rejeita campos obrigatórios vazios', async () => {
        const req = reqValida();

        req.body.nome = '';

        const res = criarResposta();

        await editarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(usuarioModel.buscarPorId)
            .not.toHaveBeenCalled();
    });

    test('retorna 404 quando o usuário não existe', async () => {
        usuarioModel.buscarPorId.mockResolvedValue(null);

        const res = criarResposta();

        await editarUsuario(reqValida(), res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(usuarioModel.atualizarComTransacao)
            .not.toHaveBeenCalled();
    });

    test('bloqueia edição quando o login já está em uso', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 2
        });

        usuarioModel.verificarLogin.mockResolvedValue(true);

        const res = criarResposta();

        await editarUsuario(reqValida(), res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(usuarioModel.atualizarComTransacao)
            .not.toHaveBeenCalled();
    });

    test('bloqueia edição quando o e-mail já está em uso', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 2
        });

        usuarioModel.verificarLogin.mockResolvedValue(false);
        usuarioModel.verificarEmail.mockResolvedValue(true);

        const res = criarResposta();

        await editarUsuario(reqValida(), res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(usuarioModel.atualizarComTransacao)
            .not.toHaveBeenCalled();
    });

    test('retorna o status informado pelo Model quando a atualização falha', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 2
        });

        usuarioModel.verificarLogin.mockResolvedValue(false);
        usuarioModel.verificarEmail.mockResolvedValue(false);

        usuarioModel.atualizarComTransacao.mockRejectedValue(
            Object.assign(
                new Error('E-mail em uso'),
                { statusCode: 409 }
            )
        );

        const res = criarResposta();
        const logOriginal = console.error;

        console.error = jest.fn();

        try {
            await editarUsuario(reqValida(), res);
        } finally {
            console.error = logOriginal;
        }

        expect(res.status).toHaveBeenCalledWith(409);

        expect(res.json).toHaveBeenCalledWith({
            sucesso: false,
            mensagem: 'E-mail em uso'
        });
    });
});

// EXCLUIR USUÁRIO
describe('RF - Excluir usuário', () => {
    const reqAdmin = (id = '3') => ({
        params: { id },
        usuario: { id_nivel_acesso: 1 }
    });

    test('exclui usuário existente quando solicitado por administrador', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 3
        });

        usuarioModel.excluir.mockResolvedValue(true);

        const res = criarResposta();

        await excluirUsuario(reqAdmin(), res);

        expect(usuarioModel.buscarPorId)
            .toHaveBeenCalledWith('3');

        expect(usuarioModel.excluir)
            .toHaveBeenCalledWith('3');

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            sucesso: true,
            mensagem: 'Usuário excluído com sucesso.',
            idUsuario: 3
        });
    });

    test('bloqueia exclusão por usuário não administrador', async () => {
        const req = reqAdmin();

        req.usuario.id_nivel_acesso = 2;

        const res = criarResposta();

        await excluirUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(usuarioModel.excluir)
            .not.toHaveBeenCalled();
    });

    test('rejeita identificador inválido', async () => {
        const res = criarResposta();

        await excluirUsuario(reqAdmin('abc'), res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(usuarioModel.buscarPorId)
            .not.toHaveBeenCalled();
    });

    test('retorna 404 quando o usuário não existe', async () => {
        usuarioModel.buscarPorId.mockResolvedValue(null);

        const res = criarResposta();

        await excluirUsuario(reqAdmin(), res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(usuarioModel.excluir)
            .not.toHaveBeenCalled();
    });

    test('retorna 409 quando o Model não confirma a exclusão', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 3
        });

        usuarioModel.excluir.mockResolvedValue(false);

        const res = criarResposta();

        await excluirUsuario(reqAdmin(), res);

        expect(res.status).toHaveBeenCalledWith(409);

        expect(usuarioModel.excluir)
            .toHaveBeenCalledWith('3');
    });

    test('retorna 409 quando existem registros relacionados', async () => {
        usuarioModel.buscarPorId.mockResolvedValue({
            id_usuario: 3
        });

        usuarioModel.excluir.mockRejectedValue({
            code: 'ER_ROW_IS_REFERENCED_2'
        });

        const res = criarResposta();
        const logOriginal = console.error;

        console.error = jest.fn();

        try {
            await excluirUsuario(reqAdmin(), res);
        } finally {
            console.error = logOriginal;
        }

        expect(res.status).toHaveBeenCalledWith(409);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                sucesso: false,
                mensagem: expect.stringContaining(
                    'registros relacionados'
                )
            })
        );
    });
});