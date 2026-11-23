const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const codigo = fs.readFileSync(path.join(__dirname, '../../views/js/navegacao-sessao.js'), 'utf8');

function preparar(pagina, nivel) {
    const menu = jest.fn();
    const redirecionar = jest.fn();
    const consultar = jest.fn().mockResolvedValue({
        ok: Boolean(nivel),
        status: nivel ? 200 : 401,
        json: async () => ({ nome: 'Usuário de teste', login: 'teste', nivel })
    });
    const contexto = {
        fetch: consultar,
        window: { location: { pathname: '/html/' + pagina, search: '?origem=adm', replace: redirecionar } },
        document: { querySelectorAll: () => [], querySelector: () => null, body: { style: {} }, addEventListener() {} },
        padronizarMenuLateral: menu
    };
    const iniciar = vm.runInNewContext(codigo + '\nconfigurarNavegacaoDaSessao', contexto);
    return { iniciar, menu, redirecionar, consultar };
}

test('menu de Técnico usa a sessão e compartilha uma consulta por página', async () => {
    const { iniciar, menu, redirecionar, consultar } = preparar('produtos.html', 2);
    await Promise.all([iniciar(), iniciar()]);
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(consultar).toHaveBeenCalledWith('/usuarios/me', expect.any(Object));
    expect(menu).toHaveBeenCalledWith(true);
    expect(redirecionar).not.toHaveBeenCalled();
});

test('Central de Relatórios encaminha Técnico ao painel e permite menu do Administrador', async () => {
    const tecnico = preparar('relatorios.html', 2);
    await tecnico.iniciar();
    expect(tecnico.redirecionar).toHaveBeenCalledWith('dashboard_tec.html');
    expect(tecnico.menu).not.toHaveBeenCalled();

    const admin = preparar('relatorios.html', 1);
    await admin.iniciar();
    expect(admin.menu).toHaveBeenCalledWith(false);
    expect(admin.redirecionar).not.toHaveBeenCalled();
});

test('sessão ausente encaminha ao login antes de montar o menu', async () => {
    const { iniciar, menu, redirecionar } = preparar('produtos.html');
    await iniciar();
    expect(redirecionar).toHaveBeenCalledWith('login.html');
    expect(menu).not.toHaveBeenCalled();
});
