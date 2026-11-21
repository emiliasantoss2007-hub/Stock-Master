const COLUNAS = Object.freeze([
    { campo: 'id_movimentacao', titulo: 'Código' },
    { campo: 'nome_produto', titulo: 'Produto' },
    { campo: 'sku_produto', titulo: 'SKU' },
    { campo: 'tipo_movimentacao', titulo: 'Tipo de movimentação' },
    { campo: 'quantidade', titulo: 'Quantidade' },
    { campo: 'data_movimentacao', titulo: 'Data' },
    { campo: 'nome_responsavel', titulo: 'Responsável' },
    { campo: 'justificativa', titulo: 'Justificativa' }
].map(coluna => Object.freeze(coluna)));

function prepararValor(valor, campo, indice) {
    if (valor == null) return null;
    if (typeof valor === 'string' || Number.isFinite(valor)) return valor;
    if (campo === 'data_movimentacao' && valor instanceof Date && Number.isFinite(valor.getTime())) {
        return new Date(valor.getTime());
    }
    throw new TypeError(`Valor inválido em ${campo} no registro ${indice + 1}.`);
}

/**
 * Prepara o resultado de consultarHistorico(), mantendo a ordem da consulta.
 * Cada posição de uma linha corresponde à mesma posição em colunas.
 * Células ausentes são null. Datas e números mantêm seus tipos.
 * O gerador é responsável pela apresentação e pela paginação.
 *
 * @param {object[]} registros Registros de movimentação retornados pelo histórico.
 * @returns {{ colunas: ReadonlyArray<{ campo: string, titulo: string }>, linhas: Array<Array<string | number | Date | null>> }}
 */
function prepararDadosRelatorioPdf(registros) {
    if (!Array.isArray(registros)) {
        throw new TypeError('Informe uma lista de movimentações para o relatório PDF.');
    }

    const linhas = Array.from(registros, (registro, indice) => {
        if (!registro || typeof registro !== 'object' ||
            !COLUNAS.some(({ campo }) => Object.hasOwn(registro, campo))) {
            throw new TypeError(`Movimentação inválida no registro ${indice + 1}.`);
        }
        return COLUNAS.map(({ campo }) => prepararValor(
            Object.hasOwn(registro, campo) ? registro[campo] : null,
            campo,
            indice
        ));
    });

    return { colunas: COLUNAS, linhas };
}

module.exports = { prepararDadosRelatorioPdf };
