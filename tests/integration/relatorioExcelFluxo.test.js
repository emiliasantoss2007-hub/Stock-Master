jest.mock('../../src/config/database', () => ({ query: jest.fn() }));

const express = require('express');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');
const connection = require('../../src/config/database');
const sessoes = require('../../src/services/sessaoService');
const { criarRelatorioExcelRoutes } = require('../../src/routes/relatorioExcelRoutes');

const ROTA = '/api/relatorio/movimentacoes/excel';
const SENHA_TESTE = 'senha-do-teste-rf19';
const HASH_TESTE = bcrypt.hashSync(SENHA_TESTE, 4);

let server;
let origem;
let admin;
let tecnico;

beforeAll(async () => {
    const listen = express.application.listen;
    const interceptar = jest.spyOn(express.application, 'listen').mockImplementation(function () {
        server = listen.call(this, 0, '127.0.0.1');
        return server;
    });
    try {
        require('../../server');
    } finally {
        interceptar.mockRestore();
    }
    await new Promise((resolve, reject) => server.once('listening', resolve).once('error', reject));
    origem = 'http://127.0.0.1:' + server.address().port;
    admin = await entrar('admin-rf19', 1);
    tecnico = await entrar('tecnico-rf19', 2);
});

afterAll(async () => {
    sessoes.encerrar(admin);
    sessoes.encerrar(tecnico);
    if (server) await new Promise(resolve => server.close(resolve));
});

beforeEach(() => connection.query.mockReset());

async function entrar(login, nivel) {
    retornarRegistros([{
        id_usuario: nivel,
        login,
        senha_hash: HASH_TESTE,
        status: 1,
        id_nivel_acesso: nivel,
        perfil: nivel === 1 ? 'Administrador' : 'T?cnico'
    }]);
    const resposta = await fetch(origem + '/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ login, senha: SENHA_TESTE })
    });
    expect(resposta.status).toBe(200);
    expect(connection.query).toHaveBeenLastCalledWith(expect.stringContaining('WHERE u.login = ?'), [login], expect.any(Function));
    const cookie = resposta.headers.get('set-cookie');
    expect(cookie).toMatch(/^stockmaster_session=[a-f0-9]{64};/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/');
    const token = cookie.split(';', 1)[0].slice('stockmaster_session='.length);
    expect(sessoes.obterUsuario(token)).toMatchObject({ id_usuario: nivel, id_nivel_acesso: nivel });
    return token;
}

function solicitar(query = '', token = admin) {
    return fetch(origem + ROTA + query, { headers: { cookie: 'stockmaster_session=' + token } });
}

function retornarRegistros(registros) {
    connection.query.mockImplementationOnce((sql, parametros, callback) => callback(null, registros));
}

async function lerExcel(resposta) {
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get('content-type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(resposta.headers.get('content-disposition')).toContain('attachment; filename="relatorio-movimentacoes.xlsx"');
    expect(resposta.headers.get('cache-control')).toBe('no-store');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await resposta.arrayBuffer());
    return workbook.getWorksheet('Movimentações');
}

test('sess?o emitida pelo login administrativo permite consultar e baixar o XLSX de oito campos', async () => {
    const data = new Date('2026-09-08T14:30:00Z');
    retornarRegistros([{
        id_movimentacao: 17,
        nome_produto: 'Tela',
        sku_produto: 'ABC',
        tipo_movimentacao: 'ENTRADA',
        quantidade: 12,
        data_movimentacao: data,
        nome_responsavel: 'Operador',
        justificativa: null,
        login_responsavel: 'campo que não deve ser exportado'
    }]);
    const planilha = await lerExcel(await solicitar('?dataInicio=2026-09-01&dataFim=2026-09-30'));
    expect(connection.query).toHaveBeenCalledTimes(1);
    expect(connection.query).toHaveBeenCalledWith(expect.stringContaining('m.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)'),
        ['2026-09-01 00:00:00', '2026-09-30'], expect.any(Function));
    expect(planilha.getRow(1).values.slice(1)).toEqual([
        'Código', 'Produto', 'SKU', 'Tipo de movimentação', 'Quantidade', 'Data', 'Responsável', 'Justificativa'
    ]);
    expect(planilha.getRow(2).values.slice(1)).toEqual([17, 'Tela', 'ABC', 'ENTRADA', 12, data, 'Operador']);
    expect(planilha.getCell('H2').value).toBeNull();
});

test('exporta uma planilha apenas com cabeçalhos quando a consulta retorna vazio', async () => {
    retornarRegistros([]);
    const planilha = await lerExcel(await solicitar());
    expect(planilha.rowCount).toBe(1);
    expect(planilha.columnCount).toBe(8);
});

test('rejeita identidade declarada pelo cliente sem uma sessão válida', async () => {
    const resposta = await fetch(origem + ROTA, {
        headers: { 'x-user': JSON.stringify({ id_nivel_acesso: 1 }), authorization: 'Bearer invalido' }
    });
    expect(resposta.status).toBe(401);
    expect(connection.query).not.toHaveBeenCalled();
});

test('impede a consulta quando a sessão pertence a um técnico', async () => {
    expect((await solicitar('', tecnico)).status).toBe(403);
    expect(connection.query).not.toHaveBeenCalled();
});

test('rejeita categoria sem consultar o histórico', async () => {
    const resposta = await solicitar('?categoria=Telas');
    expect(resposta.status).toBe(400);
    expect((await resposta.json()).mensagem).toMatch(/categoria/);
    expect(connection.query).not.toHaveBeenCalled();
});

test('retorna erro de consulta sem expor detalhes do banco', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        connection.query.mockImplementationOnce((sql, parametros, callback) => callback(new Error('detalhe interno')));
        const resposta = await solicitar();
        expect(resposta.status).toBe(500);
        expect((await resposta.json()).mensagem).not.toContain('detalhe interno');
    } finally {
        log.mockRestore();
    }
});

test('exige middlewares de autenticação e autorização para criar a rota', () => {
    expect(() => criarRelatorioExcelRoutes({ consultarHistorico() {} })).toThrow(TypeError);
});

test('login com senha inv?lida n?o emite cookie de sess?o', async () => {
    retornarRegistros([{ login: 'senha-invalida-rf19', senha_hash: HASH_TESTE, status: 1 }]);
    const resposta = await fetch(origem + '/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ login: 'senha-invalida-rf19', senha: 'incorreta' })
    });
    expect(resposta.status).toBe(401);
    expect(resposta.headers.get('set-cookie')).toBeNull();
});

test('logout revoga a sess?o administrativa usada pela exporta??o', async () => {
    const token = await entrar('logout-rf19', 1);
    const resposta = await fetch(origem + '/api/auth/logout', {
        method: 'POST',
        headers: { cookie: 'stockmaster_session=' + token }
    });
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get('set-cookie')).toMatch(/^stockmaster_session=;/);
    expect(sessoes.obterUsuario(token)).toBeNull();
    connection.query.mockClear();
    expect((await solicitar('', token)).status).toBe(401);
    expect(connection.query).not.toHaveBeenCalled();
});
