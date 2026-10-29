const connection = require('../config/database');

const TIPOS_MOVIMENTACAO = new Set(['ENTRADA', 'SAIDA', 'EXPURGO']);

function erroFiltro(mensagem) {
    const erro = new TypeError(mensagem);
    erro.code = 'INVALID_FILTER';
    return erro;
}

function validarIdProduto(valor) {
    if (valor === undefined || valor === null || valor === '') return null;

    const texto = String(valor).trim();
    if (!/^\d+$/.test(texto)) {
        throw erroFiltro('id_produto deve ser um inteiro positivo.');
    }

    const idProduto = Number(texto);
    if (!Number.isSafeInteger(idProduto) || idProduto <= 0) {
        throw erroFiltro('id_produto deve ser um inteiro positivo.');
    }

    return idProduto;
}

function validarData(valor, nomeCampo) {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        throw erroFiltro(`${nomeCampo} deve usar o formato YYYY-MM-DD.`);
    }

    const ano = Number(valor.slice(0, 4));
    const data = new Date(`${valor}T00:00:00.000Z`);
    if (ano < 1000 || Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
        throw erroFiltro(`${nomeCampo} não contém uma data válida.`);
    }

    return valor;
}

function normalizarTipo(valor) {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor !== 'string') {
        throw erroFiltro('tipo_movimentacao deve ser um texto válido.');
    }

    const tipo = valor
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();

    if (!tipo) return null;
    if (!TIPOS_MOVIMENTACAO.has(tipo)) {
        throw erroFiltro('tipo_movimentacao deve ser ENTRADA, SAIDA ou EXPURGO.');
    }

    return tipo;
}

async function consultarHistorico(filtros = {}) {
    if (!filtros || typeof filtros !== 'object' || Array.isArray(filtros)) {
        throw erroFiltro('Os filtros devem ser informados em um objeto.');
    }

    const idProduto = validarIdProduto(filtros.id_produto);
    const dataInicio = validarData(filtros.data_inicio, 'data_inicio');
    const dataFim = validarData(filtros.data_fim, 'data_fim');
    const tipo = normalizarTipo(filtros.tipo_movimentacao);

    if (dataInicio && dataFim && dataInicio > dataFim) {
        throw erroFiltro('data_inicio não pode ser posterior a data_fim.');
    }

    const condicoes = [];
    const valores = [];

    if (idProduto !== null) {
        condicoes.push('m.id_produto = ?');
        valores.push(idProduto);
    }

    if (dataInicio) {
        condicoes.push('m.data_movimentacao >= ?');
        valores.push(`${dataInicio} 00:00:00`);
    }

    if (dataFim) {
        condicoes.push('m.data_movimentacao < DATE_ADD(?, INTERVAL 1 DAY)');
        valores.push(dataFim);
    }

    if (tipo) {
        condicoes.push("REPLACE(UPPER(TRIM(m.tipo_movimentacao)), 'Í', 'I') = ?");
        valores.push(tipo);
    }

    const sql = `
        SELECT
            m.id_movimentacao,
            m.id_produto,
            p.nome AS nome_produto,
            p.sku AS sku_produto,
            m.id_usuario,
            u.nome AS nome_responsavel,
            u.login AS login_responsavel,
            m.tipo_movimentacao,
            m.quantidade,
            m.data_movimentacao,
            m.justificativa
        FROM movimentacao m
        INNER JOIN produto p ON p.id_produto = m.id_produto
        INNER JOIN usuario u ON u.id_usuario = m.id_usuario
        ${condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : ''}
        ORDER BY m.data_movimentacao DESC, m.id_movimentacao DESC
    `;

    return new Promise((resolve, reject) => {
        connection.query(sql, valores, (erro, resultados) => {
            if (erro) return reject(erro);
            resolve(resultados);
        });
    });
}

module.exports = { consultarHistorico };