jest.mock('../../src/config/database', () => ({ query: jest.fn() }));

const express = require('express');
const banco = require('../../src/config/database');
const sessoes = require('../../src/services/sessaoService');

let servidor;
let origem;

beforeAll(async () => {
    const listen = express.application.listen;
    const interceptar = jest.spyOn(express.application, 'listen').mockImplementation(function () {
        servidor = listen.call(this, 0, '127.0.0.1');
        return servidor;
    });
    try {
        require('../../server');
    } finally {
        interceptar.mockRestore();
    }
    if (!servidor.listening) {
        await new Promise((resolve, reject) => servidor.once('listening', resolve).once('error', reject));
    }
    origem = 'http://127.0.0.1:' + servidor.address().port;
});

afterAll(async () => {
    if (servidor) await new Promise(resolve => servidor.close(resolve));
});

beforeEach(() => banco.query.mockReset());

function abrir(caminho, token) {
    return fetch(origem + caminho, {
        redirect: 'manual',
        headers: token ? { cookie: 'stockmaster_session=' + token } : {}
    });
}

test.each([
    [1, '/html/dashboard_tec.html', '/html/dashboard_adm.html'],
    [2, '/html/dashboard_adm.html', '/html/dashboard_tec.html']
])('nível %i recebe identidade mínima e retorna ao próprio dashboard', async (nivel, errado, correto) => {
    const id = 20 + nivel;
    const token = sessoes.criar({ id_usuario: id, id_nivel_acesso: nivel });
    try {
        banco.query.mockImplementationOnce((_sql, _parametros, callback) => callback(null, [{
             id_usuario: id, nome: 'Pessoa Teste', login: 'pessoa.teste', email: 'teste@example.test', status: 1, id_nivel_acesso: nivel, perfil: nivel === 1 ? 'Administrador' : 'Técnico'
        }]));

        const perfil = await abrir('/usuarios/me?id=1&origem=adm', token);
        expect(perfil.status).toBe(200);
        expect(perfil.headers.get('cache-control')).toBe('no-store');
        expect(await perfil.json()).toEqual({nome: 'Pessoa Teste', email: 'teste@example.test', login: 'pessoa.teste', nivel, perfil: nivel === 1 ? 'Administrador' : 'Técnico'});
        expect(banco.query).toHaveBeenCalledWith(expect.stringContaining('WHERE u.id_usuario = ?'), [id], expect.any(Function));

        const painel = await abrir(errado + '?origem=adm', token);
        expect(painel.status).toBe(302);
        expect(painel.headers.get('location')).toBe(correto);
        expect((await abrir(correto, token)).status).toBe(200);
    } finally {
        sessoes.encerrar(token);
    }
});

test('sessão ausente ou expirada bloqueia o perfil e a página compartilhada', async () => {
    const criarNoPassado = jest.spyOn(Date, 'now').mockReturnValue(Date.now() - 9 * 60 * 60 * 1000);
    const expirado = sessoes.criar({ id_usuario: 2, id_nivel_acesso: 2 });
    criarNoPassado.mockRestore();

    for (const token of [undefined, expirado]) {
        expect((await abrir('/usuarios/me', token)).status).toBe(401);
        const pagina = await abrir('/html/cadastrar_produto.html?origem=adm', token);
        expect(pagina.status).toBe(302);
        expect(pagina.headers.get('location')).toBe('/html/login.html');
    }
    expect(banco.query).not.toHaveBeenCalled();
});
