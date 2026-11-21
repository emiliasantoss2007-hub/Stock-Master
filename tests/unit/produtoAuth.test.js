const produtoAuth = require('../../src/middlewares/produtoAuth');
const sessaoService = require('../../src/services/sessaoService');

describe('Autenticação por sessão no cadastro de produtos', () => {
    test.each(['cookie', 'Bearer'])('autentica sessão válida recebida por %s', (tipo) => {
        const usuario = { id_usuario: 4, id_nivel_acesso: 2, perfil: { id: 2, descricao: 'Técnico' } };
        const token = sessaoService.criar(usuario);
        const headers = tipo === 'cookie'
            ? { cookie: `other=value; stockmaster_session=${token}` }
            : { authorization: `Bearer ${token}` };
        const req = { headers };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        produtoAuth(req, res, next);

        expect(req.usuario).toEqual(usuario);
        expect(req.authMethod).toBe(tipo === 'cookie' ? 'cookie' : 'bearer');
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test.each([
        [{}],
        [{ cookie: 'stockmaster_session=invalid' }]
    ])('rejeita sessão ausente ou inválida', (headers) => {
        const req = { headers };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        produtoAuth(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('rejeita sessão expirada', () => {
        jest.useFakeTimers();
        const token = sessaoService.criar({ id_usuario: 4, id_nivel_acesso: 2 });
        jest.advanceTimersByTime(8 * 60 * 60 * 1000 + 1);
        const req = { headers: { cookie: `stockmaster_session=${token}` } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        produtoAuth(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        jest.useRealTimers();
    });
});