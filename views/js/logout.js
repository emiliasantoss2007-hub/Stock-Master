"use strict";

document.querySelectorAll('a[href="login.html"]').forEach((link) => {
    link.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            const resposta = await fetch("/api/auth/logout", {
                method: "POST"
            });

            if (!resposta.ok) {
                alert("Não foi possível encerrar a sessão.");
                return;
            }

            window.location.href = "/html/login.html";

        } catch (erro) {
            console.error("[StockMaster] Erro ao realizar logout:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
});