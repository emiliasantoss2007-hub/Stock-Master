jest.mock('../../src/config/database', () => ({ query: jest.fn() }));

const express = require('express');
const request = require('supertest');
const banco = require('../../src/config/database');
const sessoes = require('../../src/services/sessaoService');
const dashboard = require('../../src/routes/dashboardRoutes');

const app = express();
app.use('/api', dashboard);
const rota = '/api/dashboard';
const admin = sessoes.criar({ id_usuario: 1, id_nivel_acesso: 1 });
const tecnico = sessoes.criar({ id_usuario: 2, id_nivel_acesso: 2 });

beforeEach(() => banco.query.mockReset());
afterAll(() => [admin, tecnico].forEach(token => sessoes.encerrar(token)));

function consultar(token) {
    return request(app).get(rota).set('Cookie', 'stockmaster_session=' + token);
}

function simular(estoque, ativos, recentes) {
    banco.query.mockImplementationOnce((_sql, _params, cb) => cb(null, [estoque]))
        .mockImplementationOnce((_sql, _params, cb) => cb(null, [{ total: ativos }]))
        .mockImplementationOnce((_sql, _params, cb) => cb(null, recentes));
}

test('rejeita sessão ausente e perfil Técnico antes de consultar o MySQL', async () => {
    await request(app).get(rota).expect(401);
    await consultar(tecnico).expect(403);
    expect(banco.query).not.toHaveBeenCalled();
});

test('agrega o estoque, conta usuários ativos e devolve as movimentações mais recentes', async () => {
    simular({ cadastrados: 3, unidades: '28', criticos: 1 }, 2, [{
        nome_produto: 'Produto de teste', tipo_movimentacao: 'entrada', quantidade: 4,
        data_movimentacao: '2026-11-01T12:00:00.000Z', nome_responsavel: 'Responsável de teste',
        login_responsavel: 'login.interno'
    }]);
    const resposta = await consultar(admin).expect('Cache-Control', 'no-store').expect(200);
    expect(resposta.body).toEqual({
        indicadores: { cadastrados: 3, unidades: 28, criticos: 1, ativos: 2 },
        recentes: [{
            produto: 'Produto de teste', tipo: 'entrada', quantidade: 4,
            data: '2026-11-01T12:00:00.000Z', responsavel: 'Responsável de teste'
        }]
    });
    const [[sqlEstoque], [sqlUsuarios], [sqlHistorico, limite]] = banco.query.mock.calls;
    expect(sqlEstoque).toContain('SUM(quantidade_estoque)');
    expect(sqlEstoque).toContain('quantidade_estoque <= estoque_minimo');
    expect(sqlUsuarios).toContain('WHERE status = TRUE');
    expect(sqlHistorico).toMatch(/ORDER BY m\.data_movimentacao DESC, m\.id_movimentacao DESC\s+LIMIT \?/);
    expect(limite).toEqual([5]);
});

test('banco vazio devolve indicadores zero e lista vazia', async () => {
    simular({ cadastrados: 0, unidades: '0', criticos: 0 }, 0, []);
    await consultar(admin).expect(200, { indicadores: { cadastrados: 0, unidades: 0, ativos: 0, criticos: 0 }, recentes: [] });
});

test('falha na consulta devolve erro genérico, sem dados demonstrativos', async () => {
    banco.query.mockImplementation((_sql, _params, cb) => cb(new Error('Detalhe interno de teste')));
    await consultar(admin).expect(500, { mensagem: 'Não foi possível consultar os dados do painel.' });
});
