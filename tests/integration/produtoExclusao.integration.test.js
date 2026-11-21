require('dotenv').config();

const temConfiguracaoMySQL = ['DB_HOST', 'DB_USER', 'DB_NAME']
    .every((chave) => Boolean(process.env[chave]));

const testeComBanco = temConfiguracaoMySQL ? test : test.skip;

describe('RF-10 - integração da exclusão de produtos com MySQL', () => {
    let connection;
    let server;
    let baseUrl;

    beforeAll(async () => {
        if (!temConfiguracaoMySQL) return;

        connection = require('../../src/config/database');

        const express = require('express');
        const produtoRoutes = require('../../src/routes/produtoRoutes');

        const app = express();
        app.use(express.json());
        app.use('/api', produtoRoutes);

        server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => {
                resolve(listener);
            });
        });

        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((erro) => erro ? reject(erro) : resolve());
            });
        }

        if (connection) {
            await new Promise((resolve, reject) => {
                connection.end((erro) => erro ? reject(erro) : resolve());
            });
        }
    });

    testeComBanco(
        'bloqueia a exclusão com estoque positivo e permite quando o saldo é zero',
        async () => {
            const produtoModel = require('../../src/models/produtoModel');
            const sessaoService = require('../../src/services/sessaoService');

            const executarQuery = (sql, valores = []) =>
                new Promise((resolve, reject) => {
                    connection.query(sql, valores, (erro, resultado) => {
                        if (erro) return reject(erro);
                        resolve(resultado);
                    });
                });

            const sku = `RF10-TESTE-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

            let token;
            let transacaoIniciada = false;

            try {
                await new Promise((resolve, reject) => {
                    connection.beginTransaction((erro) => {
                        if (erro) return reject(erro);
                        transacaoIniciada = true;
                        resolve();
                    });
                });

                // Cadastra um produto exclusivo para o teste.
                const cadastro = await new Promise((resolve, reject) => {
                    produtoModel.cadastrarProduto({
                        sku,
                        nome: 'Produto de teste RF-10',
                        categoria: 'Teste',
                        quantidade_estoque: 1,
                        estoque_minimo: 0,
                        valor: 10
                    }, (erro, resultado) => {
                        if (erro) return reject(erro);
                        resolve(resultado);
                    });
                });

                const idProduto = cadastro.insertId;

                expect(idProduto).toBeTruthy();

                // Cria uma sessão de administrador para acessar a rota.
                token = sessaoService.criar({
                    id_usuario: 1,
                    id_nivel_acesso: 1,
                    perfil: {
                        id: 1,
                        descricao: 'Administrador'
                    }
                });

                const url = `${baseUrl}/api/produtos/${idProduto}`;

                // Primeiro: tenta excluir com estoque positivo.
                const respostaBloqueada = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const resultadoBloqueado = await respostaBloqueada.json();

                expect(respostaBloqueada.status).toBe(409);
                expect(resultadoBloqueado.sucesso).toBe(false);

                // Zera o estoque do produto exclusivo de teste.
                const atualizacao = await executarQuery(
                    'UPDATE produto SET quantidade_estoque = 0 WHERE id_produto = ?',
                    [idProduto]
                );

                expect(atualizacao.affectedRows).toBe(1);

                // Segundo: tenta excluir com estoque zerado.
                const respostaExclusao = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const resultadoExclusao = await respostaExclusao.json();

                expect(respostaExclusao.status).toBe(200);
                expect(resultadoExclusao).toMatchObject({
                    sucesso: true,
                    idProduto,
                    operacao: 'exclusao'
                });

                // Confirma que o produto não está mais na tabela.
                const produtoRestante = await executarQuery(
                    'SELECT id_produto FROM produto WHERE id_produto = ?',
                    [idProduto]
                );

                expect(produtoRestante).toHaveLength(0);

            } finally {
                if (token) {
                    sessaoService.encerrar(token);
                }

                // Desfaz toda a transação, inclusive o cadastro de teste.
                if (transacaoIniciada) {
                    await new Promise((resolve, reject) => {
                        connection.rollback((erro) => {
                            if (erro) return reject(erro);
                            resolve();
                        });
                    });
                }
            }
        },
        15000
    );

        testeComBanco(
        'bloqueia a exclusao de produto com movimentacoes registradas',
        async () => {
            const produtoModel = require('../../src/models/produtoModel');
            const sessaoService = require('../../src/services/sessaoService');

            const executarQuery = (sql, valores = []) =>
                new Promise((resolve, reject) => {
                    connection.query(sql, valores, (erro, resultado) => {
                        if (erro) return reject(erro);
                        resolve(resultado);
                    });
                });

            const sku = `RF10-MOV-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

            let token;
            let transacaoIniciada = false;

            try {
                await new Promise((resolve, reject) => {
                    connection.beginTransaction((erro) => {
                        if (erro) return reject(erro);
                        transacaoIniciada = true;
                        resolve();
                    });
                });

                // Busca um usuario existente para registrar a movimentacao.
                const usuarios = await executarQuery(
                    'SELECT id_usuario FROM usuario LIMIT 1'
                );

                expect(usuarios.length).toBeGreaterThan(0);

                const idUsuario = usuarios[0].id_usuario;

                // Cadastra um produto exclusivo para o teste.
                const cadastro = await new Promise((resolve, reject) => {
                    produtoModel.cadastrarProduto({
                        sku,
                        nome: 'Produto com movimentacao RF-10',
                        categoria: 'Teste',
                        quantidade_estoque: 1,
                        estoque_minimo: 0,
                        valor: 10
                    }, (erro, resultado) => {
                        if (erro) return reject(erro);
                        resolve(resultado);
                    });
                });

                const idProduto = cadastro.insertId;

                expect(idProduto).toBeTruthy();

                // Registra uma movimentacao para o produto.
                await executarQuery(
                    `INSERT INTO movimentacao
                    (tipo_movimentacao, quantidade, justificativa, id_produto, id_usuario)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        'SAIDA',
                        1,
                        'Teste de integracao RF-10',
                        idProduto,
                        idUsuario
                    ]
                );

                // Zera o estoque, mantendo a movimentacao registrada.
                const atualizacao = await executarQuery(
                    'UPDATE produto SET quantidade_estoque = 0 WHERE id_produto = ?',
                    [idProduto]
                );

                expect(atualizacao.affectedRows).toBe(1);

                // Cria uma sessao de administrador.
                token = sessaoService.criar({
                    id_usuario: idUsuario,
                    id_nivel_acesso: 1,
                    perfil: {
                        id: 1,
                        descricao: 'Administrador'
                    }
                });

                // Tenta excluir o produto.
                const resposta = await fetch(
                    `${baseUrl}/api/produtos/${idProduto}`,
                    {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const resultado = await resposta.json();

                expect(resposta.status).toBe(409);
                expect(resultado.sucesso).toBe(false);
                expect(resultado.mensagem).toBe(
                    'Não é possível excluir um produto com movimentações registradas.'
                );

                // Confirma que o produto continua cadastrado.
                const produtoRestante = await executarQuery(
                    'SELECT id_produto FROM produto WHERE id_produto = ?',
                    [idProduto]
                );

                expect(produtoRestante).toHaveLength(1);

            } finally {
                if (token) {
                    sessaoService.encerrar(token);
                }

                // Desfaz os registros criados durante o teste.
                if (transacaoIniciada) {
                    await new Promise((resolve, reject) => {
                        connection.rollback((erro) => {
                            if (erro) return reject(erro);
                            resolve();
                        });
                    });
                }
            }
        },
        15000
    );
});
