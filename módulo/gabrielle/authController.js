/* =========================================================
   STOCKMASTER — CONTROLLER SIMULADO DE AUTENTICAÇÃO
   ========================================================= */

"use strict";

window.StockMasterAuthController = {
    authenticate({ usuario, senha }) {
        const usuarios = {
            "administrador@gmail.com": {
                senha: "12345678",
                id: 1,
                nome: "Administrador de Demonstração",
                perfil: "Administrador",
                destino: "dashboard_adm.html"
            },
            "tecnico@gmail.com": {
                senha: "12345678",
                id: 2,
                nome: "Técnico de Demonstração",
                perfil: "Técnico",
                destino: "dashboard_tec.html"
            }
        };

        const usuarioNormalizado = usuario.trim().toLowerCase();
        const usuarioEncontrado = usuarios[usuarioNormalizado];

        return new Promise((resolve) => {
            window.setTimeout(() => {
                if (!usuarioEncontrado || usuarioEncontrado.senha !== senha) {
                    resolve({
                        success: false,
                        status: 401,
                        message: "Não foi possível realizar a autenticação. Verifique suas credenciais e tente novamente."
                    });
                    return;
                }

                resolve({
                    success: true,
                    status: 200,
                    message: "Autenticação realizada com sucesso.",
                    user: {
                        id: usuarioEncontrado.id,
                        nome: usuarioEncontrado.nome,
                        perfil: usuarioEncontrado.perfil
                    },
                    redirect: usuarioEncontrado.destino
                });
            }, 400);
        });
    }
};

console.info("StockMasterAuthController carregado com sucesso.");