const produtoCsrf = require('../../src/middlewares/produtoCsrf');

function criarRequest({ origin = 'https://stock.test', host = 'stock.test', contentType = 'application/json' } = {}) {
    return {
        protocol: 'https',
        get: (header) => ({ origin, host }[header]),
        is: (type) => contentType === type
    };
}

function criarResposta() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

describe('Proteção CSRF do cadastro de produtos', () => {
    const origemAnterior = process.env.APP_ORIGIN;

    beforeEach(() => {
        process.env.APP_ORIGIN = 'https://stock.test';
    });

    afterAll(() => {
        if (origemAnterior === undefined) delete process.env.APP_ORIGIN;
        else process.env.APP_ORIGIN = origemAnterior;
    });

    test('permite origem aprovada com JSON', () => {
        const next = jest.fn();
        const res = criarResposta();

        produtoCsrf(criarRequest(), res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test('não exige CSRF baseado em cookie quando uma credencial Bearer explícita foi usada', () => {
        const next = jest.fn();
        const res = criarResposta();

        produtoCsrf({ authMethod: 'bearer' }, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test.each([
        [{ origin: 'https://attacker.test' }],
        [{ origin: null }],
        [{ contentType: 'text/plain' }]
    ])('rejeita origem ausente/externa ou conteúdo simples: %o', (options) => {
        const next = jest.fn();
        const res = criarResposta();

        produtoCsrf(criarRequest(options), res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});