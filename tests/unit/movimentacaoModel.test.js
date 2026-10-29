jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

const connection = require('../../src/config/database');
const { consultarHistorico } = require('../../src/models/movimentacaoModel');

describe('RF-14 - Model de consulta do histórico', () => {
    beforeEach(() => jest.clearAllMocks());

    test('consulta sem filtros, relaciona produto/usuário e ordena cronologicamente', async () => {
        const registros = [{
            id_movimentacao: 12,
            id_produto: 4,
            nome_produto: 'Display LCD',
            sku_produto: 'SKU-004',
            id_usuario: 2,
            nome_responsavel: 'Ana',
            login_responsavel: 'ana',
            tipo_movimentacao: 'entrada',
            quantidade: 5,
            data_movimentacao: new Date('2026-10-28T15:00:00Z'),
            justificativa: 'Reposição'
        }];
        connection.query.mockImplementation((sql, valores, callback) => callback(null, registros));

        await expect(consultarHistorico()).resolves.toBe(registros);

        const [sql, valores] = connection.query.mock.calls[0];
        expect(valores).toEqual([]);
        expect(sql).toContain('FROM movimentacao m');
        expect(sql).toContain('INNER JOIN produto p ON p.id_produto = m.id_produto');
        expect(sql).toContain('INNER JOIN usuario u ON u.id_usuario = m.id_usuario');
        expect(sql).toContain('ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC');
        expect(sql).not.toMatch(/senha_hash|token|password/i);
    });

    test('aplica filtro por produto com parâmetro', async () => {
        connection.query.mockImplementation((sql, valores, callback) => callback(null, []));

        await expect(consultarHistorico({ id_produto: '7' })).resolves.toEqual([]);

        const [sql, valores] = connection.query.mock.calls[0];
        expect(sql).toContain('m.id_produto = ?');
        expect(valores).toEqual([7]);
    });

    test.each([
        ['ENTRADA', 'ENTRADA'],
        ['entrada', 'ENTRADA'],
        ['Saída', 'SAIDA'],
        ['SAIDA', 'SAIDA'],
        ['Expurgo', 'EXPURGO']
    ])('normaliza o filtro %s para o domínio documentado', async (entrada, esperado) => {
        connection.query.mockImplementation((sql, valores, callback) => callback(null, []));

        await consultarHistorico({ tipo_movimentacao: entrada });

        const [sql, valores] = connection.query.mock.calls[0];
        expect(sql).toContain("REPLACE(UPPER(TRIM(m.tipo_movimentacao)), 'Í', 'I') = ?");
        expect(valores).toEqual([esperado]);
    });

    test('filtra a partir da data inicial', async () => {
        connection.query.mockImplementation((sql, valores, callback) => callback(null, []));

        await consultarHistorico({ data_inicio: '2026-10-01' });

        expect(connection.query.mock.calls[0][1]).toEqual(['2026-10-01 00:00:00']);
        expect(connection.query.mock.calls[0][0]).toContain('m.data_movimentacao >= ?');
    });

    test('inclui todo o dia final através de limite superior exclusivo', async () => {
        connection.query.mockImplementation((sql, valores, callback) => callback(null, []));

        await consultarHistorico({ data_fim: '2026-10-03' });

        expect(connection.query.mock.calls[0][0]).toContain('m.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)');
        expect(connection.query.mock.calls[0][1]).toEqual(['2026-10-03']);
    });

    test('combina produto, intervalo de datas e tipo na mesma consulta', async () => {
        connection.query.mockImplementation((sql, valores, callback) => callback(null, []));

        await consultarHistorico({
            id_produto: 3,
            data_inicio: '2026-10-01',
            data_fim: '2026-10-05',
            tipo_movimentacao: 'saída'
        });

        const [sql, valores] = connection.query.mock.calls[0];
        expect(sql).toContain('m.id_produto = ? AND m.data_movimentacao >= ? AND m.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY) AND REPLACE(UPPER(TRIM(m.tipo_movimentacao)), \'Í\', \'I\') = ?');
        expect(valores).toEqual([3, '2026-10-01 00:00:00', '2026-10-05', 'SAIDA']);
    });

    test.each([
        [{ id_produto: '1 OR 1=1' }],
        [{ data_inicio: '2026-02-30' }],
        [{ data_fim: '28/10/2026' }],
        [{ data_inicio: '2026-10-10', data_fim: '2026-10-01' }],
        [{ tipo_movimentacao: "SAIDA' OR 1=1 --" }],
        [{ tipo_movimentacao: 'TRANSFERENCIA' }]
    ])('rejeita filtros inválidos sem executar SQL: %o', async (filtros) => {
        await expect(consultarHistorico(filtros)).rejects.toMatchObject({ code: 'INVALID_FILTER' });
        expect(connection.query).not.toHaveBeenCalled();
    });

    test('propaga erro de banco sem mascarar a falha', async () => {
        const erroBanco = Object.assign(new Error('Connection lost'), { code: 'PROTOCOL_CONNECTION_LOST' });
        connection.query.mockImplementation((sql, valores, callback) => callback(erroBanco));

        await expect(consultarHistorico()).rejects.toBe(erroBanco);
    });
});