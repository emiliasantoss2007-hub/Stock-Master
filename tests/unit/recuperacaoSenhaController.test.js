const { recuperarSenha } = require("../../src/controllers/recuperacaoSenhaController");

describe("Recuperação de Senha - Controller", () => {

    // TESTE 1
    it("deve retornar erro quando o e-mail não for informado", async () => {

        // Simula a requisição recebida pelo Controller
        const req = {
            body: {}
        };

        // Simula a resposta enviada pelo Controller
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Executa o Controller com os dados simulados
        await recuperarSenha(req, res);

        // Verifica se retornou o status 400
        expect(res.status).toHaveBeenCalledWith(400);

        // Verifica se retornou a mensagem esperada
        expect(res.json).toHaveBeenCalledWith({
            mensagem: "E-mail é obrigatório"
        });

    });


    // TESTE 2
    it("deve retornar erro quando o e-mail for inválido", async () => {

        const req = {
    body: {
        email: "email-invalido"
    }
};

const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

await recuperarSenha(req, res);

expect(res.status).toHaveBeenCalledWith(400);

expect(res.json).toHaveBeenCalledWith({
    mensagem: "E-mail inválido"
});

    });

   // TESTE 3
it("deve retornar erro quando o usuário não for encontrado", async () => {

    const req = {
        body: {
            email: "usuario@exemplo.com"
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    await recuperarSenha(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
        mensagem: "Usuário não encontrado"
    });

});

});