
jest.mock('../../src/models/produtoModel', () => ({
    listarRelatorioEstoque: jest.fn()
}));

const express = require('express');
const produtoModel = require('../../src/models/produtoModel');
const sessaoService = require('../../src/services/sessaoService');
const relatorioRoutes = require('../../src/routes/relatorioRoutes');

describe('GET /api/relatorios/estoque - RF-17', () => {
    let server;
    let endpoint;
    let tokenAdmin;
    let tokenTecnico;

    beforeAll(async () => {
        tokenAdmin = sessaoService.criar({
            id_usuario: 1,
            id_nivel_acesso: 1,
            perfil: { id: 1, descricao: 'Administrador' }
        });

        tokenTecnico = sessaoService.criar({
            id_usuario: 2,
            id_nivel_acesso: 2,
            perfil: { id: 2, descricao: 'Técnico' }
        });

        const app = express();

        app.use('/api/relatorios', relatorioRoutes);

        server = await new Promise((resolve) => {
            const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
        });

        endpoint = `http://127.0.0.1:${server.address().port}/api/relatorios/estoque`;
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            server.close((erro) => erro ? reject(erro) : resolve());
        });
    });

    beforeEach(() => jest.clearAllMocks());

    test('retorna 401 quando não há autenticação', async () => {
        const resposta = await fetch(endpoint);

        expect(resposta.status).toBe(401);
        expect(produtoModel.listarRelatorioEstoque).not.toHaveBeenCalled();
    });

    test('retorna 403 quando o usuário é técnico', async () => {
        const resposta = await fetch(endpoint, {
            headers: {
                Cookie: `stockmaster_session=${tokenTecnico}`
            }
        });

        expect(resposta.status).toBe(403);
        expect(produtoModel.listarRelatorioEstoque).not.toHaveBeenCalled();
    });

    test('permite que o administrador consulte o relatório', async () => {
        const relatorio = {
            resumo: {
                totalProdutos: 1,
                totalUnidades: 10,
                valorTotalEstoque: 1500,
                produtosZerados: 0
            },
            itens: [{
                idProduto: 1,
                nome: 'Fonte',
                quantidadeEstoque: 10
            }]
        };

        produtoModel.listarRelatorioEstoque.mockResolvedValue(relatorio);

        const resposta = await fetch(endpoint, {
            headers: {
                Cookie: `stockmaster_session=${tokenAdmin}`
            }
        });

        const corpo = await resposta.json();

        expect(resposta.status).toBe(200);
        expect(resposta.headers.get('content-type')).toMatch(/application\/json/);
        expect(corpo.sucesso).toBe(true);
        expect(corpo.dados).toEqual(relatorio);
        expect(produtoModel.listarRelatorioEstoque).toHaveBeenCalledTimes(1);
    });

    test('retorna erro 500 quando o Model falha', async () => {
        const logErro = jest.spyOn(console, 'error').mockImplementation(() => {});

        produtoModel.listarRelatorioEstoque.mockRejectedValue(
            new Error('Erro interno no banco')
        );

        try {
            const resposta = await fetch(endpoint, {
                headers: {
                    Cookie: `stockmaster_session=${tokenAdmin}`
                }
            });

            expect(resposta.status).toBe(500);

            await expect(resposta.json()).resolves.toEqual({
                sucesso: false,
                mensagem: 'Erro ao gerar relatório de estoque.'
            });
        } finally {
            logErro.mockRestore();
        }
    });
});