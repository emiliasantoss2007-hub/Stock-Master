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
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await AuthController.autenticar({ body: { login: 'tecnico', senha: 'senha' } }, res);

        const resposta = res.json.mock.calls[0][0];
        expect(res.status).toHaveBeenCalledWith(200);
        expect(resposta.accessToken).toMatch(/^[a-f0-9]{64}$/);
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
});