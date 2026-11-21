jest.mock('../../src/config/database', () => ({ query: jest.fn() }));

const connection = require('../../src/config/database');
const { consultarHistorico } = require('../../src/models/movimentacaoModel');
const { prepararDadosRelatorioPdf } = require('../../src/models/relatorioPdfModel');

test('organiza cabeçalhos e registros na ordem esperada sem modificar a entrada', () => {
    const data = new Date('2026-09-08T17:30:00Z');
    const registro = Object.freeze({
        id_movimentacao: '00042',
        nome_produto: 'Tela',
        sku_produto: '000123',
        tipo_movimentacao: 'ENTRADA',
        quantidade: 0,
        data_movimentacao: data,
        nome_responsavel: 'Responsável de teste',
        justificativa: '',
        login_responsavel: 'campo fora do relatório'
    });
    const entradas = Object.freeze([registro, Object.freeze({ id_movimentacao: 17 })]);
    const { colunas, linhas } = prepararDadosRelatorioPdf(entradas);

    expect(colunas.map(({ titulo }) => titulo)).toEqual([
        'Código', 'Produto', 'SKU', 'Tipo de movimentação', 'Quantidade', 'Data', 'Responsável', 'Justificativa'
    ]);
    expect(colunas.map(({ campo }) => campo)).toEqual([
        'id_movimentacao', 'nome_produto', 'sku_produto', 'tipo_movimentacao',
        'quantidade', 'data_movimentacao', 'nome_responsavel', 'justificativa'
    ]);
    expect(linhas).toEqual([
        ['00042', 'Tela', '000123', 'ENTRADA', 0, data, 'Responsável de teste', ''],
        [17, null, null, null, null, null, null, null]
    ]);
    expect(linhas[0][5]).not.toBe(data);
    linhas[0][5].setUTCFullYear(2040);
    expect(registro.data_movimentacao.toISOString()).toBe('2026-09-08T17:30:00.000Z');
});

test('representa valores nulos, indefinidos e ausentes como células vazias', () => {
    const resultado = prepararDadosRelatorioPdf([{ id_movimentacao: 5, quantidade: null, justificativa: undefined }]);
    expect(resultado.linhas).toEqual([[5, null, null, null, null, null, null, null]]);
});

test('mantém os cabeçalhos quando o histórico está vazio', () => {
    const resultado = prepararDadosRelatorioPdf([]);
    expect(resultado.colunas).toHaveLength(8);
    expect(resultado.linhas).toEqual([]);
});

test.each([null, undefined, 42, 'histórico', {}])('rejeita entrada que não é lista (%p)', entrada => {
    expect(() => prepararDadosRelatorioPdf(entrada)).toThrow(TypeError);
});

test.each([null, [], {}, { outroCampo: 1 }])('rejeita registro fora do contrato (%p)', registro => {
    expect(() => prepararDadosRelatorioPdf([registro])).toThrow('Movimentação inválida no registro 1');
});

test('rejeita uma posição ausente na lista', () => {
    expect(() => prepararDadosRelatorioPdf(new Array(1))).toThrow('Movimentação inválida no registro 1');
});

test.each([
    { quantidade: NaN },
    { data_movimentacao: new Date('inválida') },
    { justificativa: { texto: 'nota' } }
])('rejeita valores incompatíveis com as células do relatório (%p)', registro => {
    expect(() => prepararDadosRelatorioPdf([registro])).toThrow(TypeError);
});

test('consome o retorno do Model de histórico com a conexão MySQL simulada', async () => {
    const registros = [
        { id_movimentacao: 2, quantidade: 7, data_movimentacao: '2026-09-09 10:05:00', id_produto: 15 },
        { id_movimentacao: 1, sku_produto: '0042', data_movimentacao: '2026-09-08 10:05:00' }
    ];
    connection.query.mockImplementationOnce((sql, parametros, callback) => callback(null, registros));

    const resultado = prepararDadosRelatorioPdf(await consultarHistorico({ id_produto: 15 }));

    expect(connection.query).toHaveBeenCalledTimes(1);
    expect(connection.query).toHaveBeenCalledWith(expect.stringContaining('m.id_produto = ?'), [15], expect.any(Function));
    expect(resultado.linhas).toEqual([
        [2, null, null, null, 7, '2026-09-09 10:05:00', null, null],
        [1, null, '0042', null, null, '2026-09-08 10:05:00', null, null]
    ]);
});
