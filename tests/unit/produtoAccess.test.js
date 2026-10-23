const produtoAccess = require('../../src/middlewares/produtoAccess');

describe('RN-07 - Permissão de cadastro de produto', () => {
    test.each([
        [{ id_nivel_acesso: 1 }, 'Administrador'],
        [{ perfil: { id: 2, descricao: 'Técnico' } }, 'Técnico'],
        [{ perfil: 'Administrador' }, 'Administrador'],
        [{ perfil: 'Técnico' }, 'Técnico']
    ])('permite o perfil %s', (usuario) => {
        const next = jest.fn();
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        produtoAccess({ usuario }, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('nega perfil não previsto na documentação', () => {
        const next = jest.fn();
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        produtoAccess({ usuario: { perfil: 'Visitante' } }, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});