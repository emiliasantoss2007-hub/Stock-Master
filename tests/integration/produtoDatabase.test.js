require('dotenv').config();

const temConfiguracaoMySQL = ['DB_HOST', 'DB_USER', 'DB_NAME']
    .every((chave) => Boolean(process.env[chave]));

const testeComBanco = temConfiguracaoMySQL ? test : test.skip;

describe('RF-08 - integração real com MySQL', () => {
    let connection;

    afterAll((done) => {
        if (!connection) return done();
        connection.end(done);
    });

    testeComBanco('inspeciona a estrutura ativa sem alterar dados', async () => {
        connection = require('../../src/config/database');
        const executarQuery = (sql) => new Promise((resolve, reject) => {
            connection.query(sql, (erro, resultado) => erro ? reject(erro) : resolve(resultado));
        });
        const [colunas, indices, duplicados] = await Promise.all([
            executarQuery("SHOW COLUMNS FROM produto"),
            executarQuery("SHOW INDEX FROM produto"),
            executarQuery('SELECT sku, COUNT(*) AS quantidade FROM produto GROUP BY sku HAVING COUNT(*) > 1')
        ]);

        console.log('[RF-08] estado da tabela produto:', JSON.stringify({
            estoqueMinimo: colunas.some((coluna) => coluna.Field === 'estoque_minimo'),
            uniqueSku: indices.some((indice) => indice.Column_name === 'sku' && indice.Non_unique === 0),
            skusDuplicados: duplicados.length
        }));
    }, 10000);

    testeComBanco('persiste estoque mínimo, rejeita SKU duplicado e mede a resposta backend', async () => {
        connection = connection || require('../../src/config/database');
        const produtoModel = require('../../src/models/produtoModel');
        const sku = `RF08-IT-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        const executarQuery = (sql, valores = []) => new Promise((resolve, reject) => {
            connection.query(sql, valores, (erro, resultado) => {
                if (erro) return reject(erro);
                resolve(resultado);
            });
        });

        await new Promise((resolve, reject) => {
            connection.beginTransaction((erro) => erro ? reject(erro) : resolve());
        });

        try {
            const inicioBackend = process.hrtime.bigint();
            const resultadoCadastro = await new Promise((resolve, reject) => {
                produtoModel.cadastrarProduto({
                    sku,
                    nome: 'Produto de integração RF-08',
                    categoria: 'Teste',
                    estoque_minimo: 7
                }, (erro, resultado) => erro ? reject(erro) : resolve(resultado));
            });
            const tempoBackendMs = Number(process.hrtime.bigint() - inicioBackend) / 1e6;

            const [produtoPersistido] = await executarQuery(
                'SELECT sku, estoque_minimo FROM produto WHERE id_produto = ?',
                [resultadoCadastro.insertId]
            );
            expect(produtoPersistido).toEqual({ sku, estoque_minimo: 7 });

            await expect(executarQuery(
                `INSERT INTO produto (sku, nome, categoria) VALUES (?, 'Produto duplicado', 'Teste')`,
                [sku]
            )).rejects.toMatchObject({ code: 'ER_DUP_ENTRY' });

            console.log(`[RF-08] tempo backend do cadastro: ${tempoBackendMs.toFixed(2)} ms`);
            expect(tempoBackendMs).toBeLessThanOrEqual(3000);
        } finally {
            await new Promise((resolve, reject) => {
                connection.rollback((erro) => erro ? reject(erro) : resolve());
            });
        }
    }, 10000);

    testeComBanco('cadastra pela rota protegida e mede a resposta HTTP do cliente local', async () => {
        const express = require('express');
        const produtoRoutes = require('../../src/routes/produtoRoutes');
        const sessaoService = require('../../src/services/sessaoService');
        connection = connection || require('../../src/config/database');
        const sku = `RF08-HTTP-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const app = express();
        app.use(express.json());
        app.use('/api', produtoRoutes);

        const server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
        });
        const token = sessaoService.criar({
            id_usuario: 1,
            id_nivel_acesso: 2,
            perfil: { id: 2, descricao: 'Técnico' }
        });
        const url = `http://127.0.0.1:${server.address().port}/api/produtos`;
        const dadosProduto = {
            sku,
            nome: 'Produto HTTP RF-08',
            categoria: 'Teste',
            estoque_minimo: 6
        };

        try {
            await new Promise((resolve, reject) => {
                connection.beginTransaction((erro) => erro ? reject(erro) : resolve());
            });

            const inicioCliente = process.hrtime.bigint();
            const resposta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dadosProduto)
            });
            const resultado = await resposta.json();
            const tempoClienteMs = Number(process.hrtime.bigint() - inicioCliente) / 1e6;

            expect(resposta.status).toBe(201);
            expect(resultado.id_produto).toBeTruthy();

            const respostaDuplicada = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dadosProduto)
            });
            expect(respostaDuplicada.status).toBe(409);

            console.log(`[RF-08] tempo cliente local até HTTP 201: ${tempoClienteMs.toFixed(2)} ms (inclui loopback, não navegador real)`);
            expect(tempoClienteMs).toBeLessThanOrEqual(3000);
        } finally {
            await new Promise((resolve, reject) => {
                connection.rollback((erro) => erro ? reject(erro) : resolve());
            });
            await new Promise((resolve, reject) => server.close((erro) => erro ? reject(erro) : resolve()));
        }
    }, 10000);
});