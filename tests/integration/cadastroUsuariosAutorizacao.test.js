jest.mock('../../src/config/database', () => ({ query: jest.fn() }));

const bcrypt = require('bcrypt');
const express = require('express');
const request = require('supertest');
const banco = require('../../src/config/database');
const auth = require('../../src/routes/authRoutes');
const usuarios = require('../../src/routes/usuarioRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', auth);
app.use(usuarios);

const cadastro = {
    nome: 'Conta de teste', email: 'conta@example.test', login: 'conta.teste',
    senha: 'SenhaDeTeste2026!', perfil: 'Administrador'
};
const senhaSessao = 'SenhaDaSessao2026!';
const hashSessao = bcrypt.hashSync(senhaSessao, 4);
const origem = 'http://stockmaster.example.test';
const origemOriginal = process.env.APP_ORIGIN;

beforeAll(() => { process.env.APP_ORIGIN = origem; });
afterAll(() => {
    if (origemOriginal === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = origemOriginal;
});
beforeEach(() => banco.query.mockReset());

async function entrar(nivel) {
    banco.query.mockImplementationOnce((_sql, _params, callback) => callback(null, [{
        id_usuario: nivel, login: 'teste', senha_hash: hashSessao, status: 1,
        id_nivel_acesso: nivel, perfil: nivel === 1 ? 'Administrador' : 'Técnico'
    }]));
    const resposta = await request(app).post('/api/auth/login').send({ login: 'teste', senha: senhaSessao }).expect(200);
    const cookie = resposta.headers['set-cookie'][0].split(';', 1)[0];
    expect(cookie).toMatch(/^stockmaster_session=/);
    banco.query.mockClear();
    return cookie;
}

test('cadastro sem sessão retorna 401 e Técnico retorna 403 antes de consultar o banco', async () => {
    await request(app).post('/usuarios').send(cadastro).expect(401);
    expect(banco.query).not.toHaveBeenCalled();
    const cookie = await entrar(2);
    await request(app).post('/usuarios').set('Cookie', cookie).set('Origin', origem).send(cadastro).expect(403);
    expect(banco.query).not.toHaveBeenCalled();
});

test('cadastro por cookie exige origem autorizada e conteúdo JSON', async () => {
    const cookie = await entrar(1);
    const enviar = () => request(app).post('/usuarios').set('Cookie', cookie);
    await enviar().send(cadastro).expect(403);
    await enviar().set('Origin', 'http://externo.example.test').send(cadastro).expect(403);
    await enviar().set('Origin', origem).type('form').send(cadastro).expect(403);
    expect(banco.query).not.toHaveBeenCalled();
});

test('administrador recebe 400 para dados inválidos antes da consulta', async () => {
    const cookie = await entrar(1);
    for (const campo of [{ nome: ['inválido'] }, { email: 'inválido' }, { senha: 'curta' }, { senha: 'á'.repeat(37) }]) {
        await request(app).post('/usuarios').set('Cookie', cookie).set('Origin', origem)
            .send({ ...cadastro, ...campo }).expect(400);
    }
    expect(banco.query).not.toHaveBeenCalled();
});

test('administrador cadastra com senha protegida e perde acesso após logout', async () => {
    const cookie = await entrar(1);
    banco.query.mockImplementationOnce((_sql, _params, callback) => callback(null, [{ id_nivel_acesso: 1 }]))
        .mockImplementationOnce((_sql, _params, callback) => callback(null, { insertId: 42 }));
    const enviar = () => request(app).post('/usuarios').set('Cookie', cookie).set('Origin', origem).send(cadastro);
    await enviar().expect(201, { message: 'Usuário cadastrado com sucesso.', id_usuario: 42 });
    expect(banco.query).toHaveBeenCalledTimes(2);
    const [sql, valores] = banco.query.mock.calls[1];
    expect(sql).toContain('INSERT INTO usuario');
    expect(valores[3]).not.toBe(cadastro.senha);
    expect(await bcrypt.compare(cadastro.senha, valores[3])).toBe(true);
    await request(app).post('/api/auth/logout').set('Cookie', cookie).expect(200);
    await enviar().expect(401);
    expect(banco.query).toHaveBeenCalledTimes(2);
});

test('falha interna do cadastro não expõe a mensagem do banco', async () => {
    const cookie = await entrar(1);
    banco.query.mockImplementationOnce((_sql, _params, callback) =>
        callback(new Error('Detalhe interno de teste')));

    await request(app).post('/usuarios').set('Cookie', cookie).set('Origin', origem)
        .send(cadastro).expect(500, { message: 'Não foi possível cadastrar o usuário.' });
    expect(banco.query).toHaveBeenCalledTimes(1);
});
