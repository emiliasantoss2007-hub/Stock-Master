
const RELATORIOS = Object.freeze({
    movimentacoes: {
        colunas: [
            { campo: 'id_movimentacao', titulo: 'Código' },
            { campo: 'nome_produto', titulo: 'Produto' },
            { campo: 'sku_produto', titulo: 'SKU' },
            { campo: 'tipo_movimentacao', titulo: 'Tipo de movimentação' },
            { campo: 'quantidade', titulo: 'Quantidade' },
            { campo: 'data_movimentacao', titulo: 'Data' },
            { campo: 'nome_responsavel', titulo: 'Responsável' },
            { campo: 'justificativa', titulo: 'Justificativa' }
        ]
    },
    estoque: {
        colunas: [
            { campo: 'idProduto', titulo: 'Código' },
            { campo: 'sku', titulo: 'SKU' },
            { campo: 'nome', titulo: 'Produto' },
            { campo: 'categoria', titulo: 'Categoria' },
            { campo: 'quantidadeEstoque', titulo: 'Quantidade em estoque' },
            { campo: 'valorUnitario', titulo: 'Valor unitário' },
            { campo: 'valorEstoque', titulo: 'Valor total em estoque' }
        ]
    },
    produtos: {
        colunas: [
            { campo: 'nome', titulo: 'Produto' },
            { campo: 'sku', titulo: 'SKU' },
            { campo: 'codigo_barras', titulo: 'Código de barras' },
            { campo: 'categoria', titulo: 'Categoria' },
            { campo: 'quantidade_estoque', titulo: 'Quantidade em estoque' }
        ]
    }
});

function prepararValor(valor, campo, indice) {
    if (valor == null) return null;

    if (typeof valor === 'string' || Number.isFinite(valor)) {
        return valor;
    }

    if (
        campo === 'data_movimentacao' &&
        valor instanceof Date &&
        Number.isFinite(valor.getTime())
    ) {
        return new Date(valor.getTime());
    }

    throw new TypeError(`Valor inválido em ${campo} no registro ${indice + 1}.`);
}

function prepararDadosRelatorioPdf(tipo, registros) {
    const configuracao = RELATORIOS[tipo];

    if (!configuracao) {
        throw new TypeError('Tipo de relatório PDF inválido.');
    }

    if (!Array.isArray(registros)) {
        throw new TypeError('Informe uma lista de registros para o relatório PDF.');
    }

    const { colunas } = configuracao;

    const linhas = Array.from(registros, (registro, indice) => {
        if (
            !registro ||
            typeof registro !== 'object' ||
            !colunas.some(({ campo }) => Object.hasOwn(registro, campo))
        ) {
            throw new TypeError(`Registro inválido na posição ${indice + 1}.`);
        }

        return colunas.map(({ campo }) =>
            prepararValor(
                Object.hasOwn(registro, campo) ? registro[campo] : null,
                campo,
                indice
            )
        );
    });

    return { tipo, colunas, linhas };
}

module.exports = { prepararDadosRelatorioPdf };
