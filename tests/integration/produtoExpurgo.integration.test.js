
require('dotenv').config();

const temConfiguracaoMySQL = ['DB_HOST', 'DB_USER', 'DB_NAME']
    .every((chave) => Boolean(process.env[chave]));

const testeComBanco = temConfiguracaoMySQL ? test : test.skip;

describe('RF-15 - Integração do Expurgo de Estoque com MySQL', () => {
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
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
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

    const executarQuery = (sql, valores = []) =>
        new Promise((resolve, reject) => {
            connection.query(sql, valores, (erro, resultado) => {
                if (erro) return reject(erro);
                resolve(resultado);
            });
        });

    testeComBanco(
        'registra expurgo, reduz o estoque e mantém o produto cadastrado',
        async () => {
            const produtoModel = require('../../src/models/produtoModel');
            const sessaoService = require('../../src/services/sessaoService');

            const sku = `RF15-EXP-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

            let token;
            let idProduto;

            try {
                const cadastro = await new Promise((resolve, reject) => {
                    produtoModel.cadastrarProduto({
                        sku,
                        nome: 'Produto de teste RF-15',
                        categoria: 'Teste',
                        quantidade_estoque: 10,
                        estoque_minimo: 0,
                        valor: 10
                    }, (erro, resultado) => {
                        if (erro) return reject(erro);
                        resolve(resultado);
                    });
                });

                idProduto = cadastro.insertId;
                expect(idProduto).toBeTruthy();

                const usuarios = await executarQuery(
                    'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
                    [1]
                );

                expect(usuarios.length).toBeGreaterThan(0);

                const idUsuario = usuarios[0].id_usuario;

                token = sessaoService.criar({
                    id_usuario: idUsuario,
                    id_nivel_acesso: 1,
                    perfil: {
                        id: 1,
                        descricao: 'Administrador'
                    }
                });

                const resposta = await fetch(
                    `${baseUrl}/api/produtos/expurgo`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id_produto: idProduto,
                            quantidade: 3,
                            justificativa: 'Produto danificado durante teste'
                        })
                    }
                );

                const resultado = await resposta.json();

                expect(resposta.status).toBe(201);
                expect(resultado.sucesso).toBe(true);

                const produtos = await executarQuery(
                    'SELECT quantidade_estoque FROM produto WHERE id_produto = ?',
                    [idProduto]
                );

                expect(produtos).toHaveLength(1);
                expect(Number(produtos[0].quantidade_estoque)).toBe(7);

                const movimentacoes = await executarQuery(
                    `SELECT tipo_movimentacao, quantidade, justificativa
                     FROM movimentacao
                     WHERE id_produto = ?`,
                    [idProduto]
                );

                expect(movimentacoes).toHaveLength(1);
                expect(movimentacoes[0]).toMatchObject({
                    tipo_movimentacao: 'EXPURGO',
                    quantidade: 3,
                    justificativa: 'Produto danificado durante teste'
                });

            } finally {
                if (token) {
                    sessaoService.encerrar(token);
                }

                if (idProduto) {
                    await executarQuery(
                        'DELETE FROM movimentacao WHERE id_produto = ?',
                        [idProduto]
                    );

                    await executarQuery(
                        'DELETE FROM produto WHERE id_produto = ?',
                        [idProduto]
                    );
                }
            }
        },
        15000
    );

    testeComBanco(
        'impede expurgo acima do saldo disponível',
        async () => {
            const produtoModel = require('../../src/models/produtoModel');
            const sessaoService = require('../../src/services/sessaoService');

            const sku = `RF15-SALDO-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

            let token;
            let idProduto;

            try {
                const cadastro = await new Promise((resolve, reject) => {
                    produtoModel.cadastrarProduto({
                        sku,
                        nome: 'Produto saldo RF-15',
                        categoria: 'Teste',
                        quantidade_estoque: 2,
                        estoque_minimo: 0,
                        valor: 10
                    }, (erro, resultado) => {
                        if (erro) return reject(erro);
                        resolve(resultado);
                    });
                });

                idProduto = cadastro.insertId;

                const usuarios = await executarQuery(
                    'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
                    [1]
                );

                expect(usuarios.length).toBeGreaterThan(0);

                token = sessaoService.criar({
                    id_usuario: usuarios[0].id_usuario,
                    id_nivel_acesso: 1,
                    perfil: {
                        id: 1,
                        descricao: 'Administrador'
                    }
                });

                const resposta = await fetch(
                    `${baseUrl}/api/produtos/expurgo`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            id_produto: idProduto,
                            quantidade: 5,
                            justificativa: 'Teste de saldo insuficiente'
                        })
                    }
                );

                const resultado = await resposta.json();

                expect(resposta.status).toBe(409);
                expect(resultado.sucesso).toBe(false);

                const produtos = await executarQuery(
                    'SELECT quantidade_estoque FROM produto WHERE id_produto = ?',
                    [idProduto]
                );

                expect(Number(produtos[0].quantidade_estoque)).toBe(2);

                const movimentacoes = await executarQuery(
                    'SELECT id_movimentacao FROM movimentacao WHERE id_produto = ?',
                    [idProduto]
                );

                expect(movimentacoes).toHaveLength(0);

            } finally {
                if (token) {
                    sessaoService.encerrar(token);
                }

                if (idProduto) {
                    await executarQuery(
                        'DELETE FROM movimentacao WHERE id_produto = ?',
                        [idProduto]
                    );

                    await executarQuery(
                        'DELETE FROM produto WHERE id_produto = ?',
                        [idProduto]
                    );
                }
            }
        },
        15000
    );
});
