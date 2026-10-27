
const connection = require("../config/database");

// EXCLUIR PRODUTO COM VERIFICAÇÃO E TRANSAÇÃO
async function excluirComVerificacao(idProduto) {
    const id = Number(idProduto);

    // Validar o identificador antes de acessar o banco.
    if (!Number.isInteger(id) || id <= 0) {
        throw criarErro(
            "O identificador do produto é inválido.",
            400,
            "PRODUCT_ID_INVALID"
        );
    }

    await iniciarTransacao();

    try {
        // 1. Localizar e bloquear o produto.
        const produtos = await query(
            `SELECT id_produto, quantidade_estoque
             FROM produto
             WHERE id_produto = ?
             FOR UPDATE`,
            [id]
        );

        if (produtos.length === 0) {
            throw criarErro(
                "Produto não encontrado.",
                404,
                "PRODUCT_NOT_FOUND"
            );
        }

        const produto = produtos[0];
        const saldo = Number(produto.quantidade_estoque);

        // 2. Bloquear exclusão se houver qualquer saldo.
        // Saldo negativo também deve ser tratado como inconsistência.
        if (!Number.isFinite(saldo) || saldo !== 0) {
            throw criarErro(
                "O produto possui saldo em estoque e não pode ser excluído.",
                409,
                "PRODUCT_HAS_STOCK"
            );
        }

        // 3. Verificar se existe histórico de movimentação.
        const movimentacoes = await query(
            `SELECT id_movimentacao
             FROM movimentacao
             WHERE id_produto = ?
             LIMIT 1
             FOR UPDATE`,
            [id]
        );

        if (movimentacoes.length > 0) {
            throw criarErro(
                "O produto possui movimentações registradas e não pode ser excluído.",
                409,
                "PRODUCT_HAS_MOVEMENTS"
            );
        }

        // 4. Excluir somente após todas as verificações.
        const resultado = await query(
            `DELETE FROM produto
             WHERE id_produto = ?`,
            [id]
        );

        if (resultado.affectedRows !== 1) {
            throw criarErro(
                "Não foi possível confirmar a exclusão do produto.",
                409,
                "PRODUCT_DELETE_NOT_CONFIRMED"
            );
        }

        // 5. Confirmar a operação.
        await confirmarTransacao();

        return {
            id_produto: id,
            excluido: true
        };

    } catch (erro) {
        // Se alguma etapa falhar, tentar desfazer as alterações.
        await desfazerTransacao();
        throw erro;
    }
}

 // RF-12 — LISTAR PRODUTOS PARA ENTRADA
async function listarParaEntrada() {
    return await query(
        `SELECT
            id_produto,
            nome,
            sku,
            quantidade_estoque
         FROM produto
         ORDER BY nome ASC`,
        []
    );
}

// RF-12 — REGISTRAR ENTRADA DE ESTOQUE
async function registrarEntrada(idProduto, quantidade, idUsuario) {
    const id = Number(idProduto);
    const qtd = Number(quantidade);
    const usuario = Number(idUsuario);

    if (!Number.isInteger(id) || id <= 0) {
        throw criarErro("Produto inválido.", 400, "PRODUCT_ID_INVALID");
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
        throw criarErro("Quantidade inválida.", 400, "QUANTITY_INVALID");
    }

    if (!Number.isInteger(usuario) || usuario <= 0) {
        throw criarErro("Usuário inválido.", 401, "USER_ID_INVALID");
    }

    await iniciarTransacao();

    try {
        const produtos = await query(
            `SELECT id_produto
             FROM produto
             WHERE id_produto = ?
             FOR UPDATE`,
            [id]
        );

        if (produtos.length === 0) {
            throw criarErro("Produto não encontrado.", 404, "PRODUCT_NOT_FOUND");
        }

        await query(
            `INSERT INTO movimentacao
                (tipo_movimentacao, quantidade, justificativa, id_produto, id_usuario)
             VALUES (?, ?, ?, ?, ?)`,
            ["entrada", qtd, "Entrada de produtos no estoque", id, usuario]
        );

        await query(
            `UPDATE produto
             SET quantidade_estoque = quantidade_estoque + ?
             WHERE id_produto = ?`,
            [qtd, id]
        );

        await confirmarTransacao();

        return {
            id_produto: id,
            quantidade: qtd
        };
    } catch (erro) {
        await desfazerTransacao();
        throw erro;
    }
}


// EXECUTAR CONSULTAS
function query(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, parametros, (erro, resultado) => {
            if (erro) {
                return reject(erro);
            }

            resolve(resultado);
        });
    });
}


// INICIAR TRANSAÇÃO
function iniciarTransacao() {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((erro) => {
            if (erro) {
                return reject(erro);
            }

            resolve();
        });
    });
}


// CONFIRMAR TRANSAÇÃO
function confirmarTransacao() {
    return new Promise((resolve, reject) => {
        connection.commit((erro) => {
            if (erro) {
                return reject(erro);
            }

            resolve();
        });
    });
}


// DESFAZER TRANSAÇÃO
function desfazerTransacao() {
    return new Promise((resolve) => {
        connection.rollback(() => resolve());
    });
}


// PADRONIZAR ERROS
function criarErro(mensagem, statusCode, code) {
    return Object.assign(new Error(mensagem), {
        statusCode,
        code
    });
}


// EXPORTAR MÉTODOS DO MODEL
module.exports = {
    excluirComVerificacao,
    listarParaEntrada,
    registrarEntrada
};
