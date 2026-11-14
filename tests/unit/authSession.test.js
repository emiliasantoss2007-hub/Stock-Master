jest.mock('../../src/models/autenticacaoModel', () => ({
    autenticar: jest.fn()
}));

const autenticacaoModel = require('../../src/models/autenticacaoModel');
const AuthController = require('../../src/controllers/authController');
const auth = require('../../src/middlewares/auth');
const sessaoService = require('../../src/services/sessaoService');

describe('Sessão de autenticação para autorização de produtos', () => {
    test('login bem-sucedido emite token reconhecido pelo servidor', async () => {
        autenticacaoModel.autenticar.mockResolvedValue({
            success: true,
            status: 200,
            data: {
                id_usuario: 5,
                perfil: { id: 2, descricao: 'Técnico' }
            }
        });
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };

        await AuthController.autenticar({
            body: { login: 'tecnico', senha: 'senha' },
            secure: true
        }, res);

        const resposta = res.json.mock.calls[0][0];
        expect(res.status).toHaveBeenCalledWith(200);
        expect(resposta.accessToken).toMatch(/^[a-f0-9]{64}$/);
        expect(res.cookie).toHaveBeenCalledWith(
            'stockmaster_session',
            resposta.accessToken,
            expect.objectContaining({
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/'
            })
        );
        expect(sessaoService.obterUsuario(resposta.accessToken)).toEqual({
            id_usuario: 5,
            id_nivel_acesso: 2,
            perfil: { id: 2, descricao: 'Técnico' }
        });
    });

    test('rejeita X-User fornecido pelo cliente', () => {
        const next = jest.fn();
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        auth({ headers: { 'x-user': JSON.stringify({ perfil: 'Administrador' }) } }, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });
    test('autentica usuário pela sessão emitida pelo login', () => {
        const usuarioEsperado = {
            id_nivel_acesso: 1,
            perfil: { id: 1, descricao: 'Administrador' }
        };
        const token = sessaoService.criar(usuarioEsperado);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        auth(req, res, next);

        expect(req.usuario).toEqual(usuarioEsperado);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('logout invalida a sessão recebida pelo cookie', () => {
        const usuario = { id_usuario: 5 };
        const token = sessaoService.criar(usuario);

        const req = {
            headers: {
                cookie: `stockmaster_session=${token}`
            },
            secure: false
        };

        const res = {
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        AuthController.encerrarSessao(req, res);

        expect(sessaoService.obterUsuario(token)).toBeNull();
        expect(res.clearCookie).toHaveBeenCalledWith(
            'stockmaster_session',
            expect.objectContaining({ path: '/' })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('logout invalida a sessão recebida pelo Bearer', () => {
        const token = sessaoService.criar({ id_usuario: 6 });

        const req = {
            headers: {
                authorization: `Bearer ${token}`
            },
            secure: false
        };

        const res = {
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        AuthController.encerrarSessao(req, res);

        expect(sessaoService.obterUsuario(token)).toBeNull();
    });

    test('logout sem cookie ou Bearer não gera erro', () => {
        const req = {
            headers: {},
            secure: false
        };

        const res = {
            clearCookie: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        AuthController.encerrarSessao(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });
});
