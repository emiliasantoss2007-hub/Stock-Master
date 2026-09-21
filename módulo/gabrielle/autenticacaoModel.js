/* =========================================================
   STOCKMASTER — AUTENTICAÇÃO (MODEL)
   RF-01 — Realizar Login
   RN-02 | RNF-01.01 | RNF-01.02 | RNF-01.03 | RNF-01.04
   ========================================================= */

"use strict";

const bcrypt = require("bcryptjs");
const connection = require("../config/database");

// Namespace da equipe: window no navegador, globalThis no Node.
const raiz = typeof window !== "undefined" ? window : globalThis;
raiz.StockMaster = raiz.StockMaster || {};

/* ---------- Configurações ---------- */
const CONFIG = Object.freeze({
    TEMPO_LIMITE_MS: 3000,          // RNF-01.04 — validação em até 3 segundos
    MAX_TENTATIVAS: 5,              // RNF-01.02 — tentativas consecutivas inválidas
    BLOQUEIO_MS: 15 * 60 * 1000,    // RNF-01.02 — duração do bloqueio
    LOGIN_MAX: 50,
    SENHA_MAX: 128
});

const MSG_CREDENCIAIS_INVALIDAS = "Login ou senha inválidos.";

// Hash fictício: usado quando o login não existe, para que o tempo de resposta
// seja parecido e não revele quais logins estão cadastrados.
const HASH_FICTICIO = bcrypt.hashSync("stockmaster-hash-ficticio", 10);

/* ---------- Funções auxiliares ---------- */
function falha(status, message, code) {
    return { success: false, status, message, code };
}

function executarQuery(sql, valores) {
    return new Promise((resolve, reject) => {
        connection.query(sql, valores, (erro, linhas) => {
            if (erro) {
                reject(erro);
                return;
            }
            resolve(linhas);
        });
    });
}

function comTimeout(promessa, ms) {
    let timer;
    const limite = new Promise((_, reject) => {
        timer = setTimeout(() => {
            const erro = new Error("Tempo limite excedido.");
            erro.code = "TIMEOUT";
            reject(erro);
        }, ms);
    });
    return Promise.race([promessa, limite]).finally(() => clearTimeout(timer));
}

/* ---------- Controle de tentativas inválidas (RNF-01.02) ---------- */
// Guardado em memória: zera se o servidor reiniciar.
const tentativas = new Map();

function chaveDoLogin(login) {
    return login.toLowerCase();
}

function restanteDoBloqueio(login) {
    const chave = chaveDoLogin(login);
    const registro = tentativas.get(chave);
    if (!registro || !registro.bloqueadoAte) return 0;

    const restante = registro.bloqueadoAte - Date.now();
    if (restante <= 0) {
        tentativas.delete(chave);
        return 0;
    }
    return restante;
}

function registrarFalha(login) {
    const agora = Date.now();
    const chave = chaveDoLogin(login);
    const registro = tentativas.get(chave) || { falhas: 0, ultimaFalha: agora, bloqueadoAte: null };

    // "Consecutivas": falhas antigas deixam de contar.
    if (agora - registro.ultimaFalha > CONFIG.BLOQUEIO_MS) registro.falhas = 0;

    registro.falhas += 1;
    registro.ultimaFalha = agora;
    if (registro.falhas >= CONFIG.MAX_TENTATIVAS) registro.bloqueadoAte = agora + CONFIG.BLOQUEIO_MS;
    tentativas.set(chave, registro);

    // Evita crescimento indefinido do Map com logins aleatórios.
    if (tentativas.size > 5000) {
        for (const [k, r] of tentativas) {
            if (agora - r.ultimaFalha > CONFIG.BLOQUEIO_MS) tentativas.delete(k);
        }
    }
}

function limparTentativas(login) {
    tentativas.delete(chaveDoLogin(login));
}

/* ---------- Model ---------- */
const Autenticacao = {

    // Consulta o usuário pelo login (RN-02: login único, garantido por UNIQUE no banco).
    buscarUsuarioPorLogin({ login }) {
        const sql = `
            SELECT u.id_usuario,
                   u.nome,
                   u.email,
                   u.login,
                   u.senha_hash,
                   u.status,
                   u.id_nivel_acesso,
                   n.descricao AS perfil
              FROM usuario u
             INNER JOIN nivel_acesso n ON n.id_nivel_acesso = u.id_nivel_acesso
             WHERE u.login = ?
             LIMIT 1`;

        return executarQuery(sql, [login]).then((linhas) => linhas[0] || null);
    },

    // Compara a senha digitada com o hash armazenado (RNF-01.01).
    verificarSenha({ senha, senhaHash }) {
        return bcrypt.compare(senha, senhaHash).catch(() => false);
    },

    // Fluxo completo do login. Sempre resolve com { success, status, message, ... }.
    autenticar({ login, senha } = {}) {
        if (typeof login !== "string" || typeof senha !== "string" || !login.trim() || !senha) {
            return Promise.resolve(falha(400, "Informe o login e a senha.", "MISSING_FIELDS"));
        }

        const loginLimpo = login.trim();
        if (loginLimpo.length > CONFIG.LOGIN_MAX || senha.length > CONFIG.SENHA_MAX) {
            return Promise.resolve(falha(401, MSG_CREDENCIAIS_INVALIDAS, "INVALID_CREDENTIALS"));
        }

        return comTimeout(processarLogin(loginLimpo, senha), CONFIG.TEMPO_LIMITE_MS)
            .catch((erro) => {
                if (erro && erro.code === "TIMEOUT") {
                    return falha(504, "Tempo limite excedido na validação. Tente novamente.", "TIMEOUT");
                }
                console.error("[StockMaster][Autenticacao] Erro ao autenticar:", erro && erro.message);
                return falha(500, "Não foi possível realizar o login no momento. Tente novamente.", "INTERNAL_ERROR");
            });
    }
};

async function processarLogin(login, senha) {
    // 1) Bloqueio por excesso de tentativas (RNF-01.02)
    const restante = restanteDoBloqueio(login);
    if (restante > 0) {
        const minutos = Math.ceil(restante / 60000);
        return falha(
            423,
            `Acesso temporariamente bloqueado por excesso de tentativas. Tente novamente em ${minutos} minuto(s).`,
            "ACCOUNT_LOCKED"
        );
    }

    // 2) Consulta no banco + verificação da senha
    const usuario = await Autenticacao.buscarUsuarioPorLogin({ login });
    const senhaConfere = await Autenticacao.verificarSenha({
        senha,
        senhaHash: usuario ? usuario.senha_hash : HASH_FICTICIO
    });

    // 3) Usuário não encontrado / credenciais inválidas (mesma mensagem para os dois)
    if (!usuario) {
        registrarFalha(login);
        return falha(401, MSG_CREDENCIAIS_INVALIDAS, "USER_NOT_FOUND");
    }
    if (!senhaConfere) {
        registrarFalha(login);
        return falha(401, MSG_CREDENCIAIS_INVALIDAS, "INVALID_CREDENTIALS");
    }

    // 4) Usuário inativo (só é revelado a quem acertou a senha)
    if (!usuario.status) {
        return falha(403, "Usuário inativo. Procure o administrador do sistema.", "USER_INACTIVE");
    }

    // 5) Sucesso — nunca devolve o senha_hash
    limparTentativas(login);
    return {
        success: true,
        status: 200,
        message: "Login realizado com sucesso.",
        data: {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            login: usuario.login,
            perfil: {
                id: usuario.id_nivel_acesso,
                descricao: usuario.perfil
            }
        }
    };
}

raiz.StockMaster.Autenticacao = Autenticacao;

if (typeof module !== "undefined" && module.exports) {
    module.exports = Autenticacao;
}

console.info("StockMaster[Autenticacao] carregado com sucesso.");