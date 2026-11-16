
"use strict";

document.addEventListener("click", async (event) => {
    const link = event.target.closest('a[href="login.html"]');

    if (!link) return;

    event.preventDefault();

    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        });
    } catch (erro) {
        console.error("Erro ao encerrar sessão:", erro);
    } finally {
        sessionStorage.removeItem("stockmaster.usuario");
        sessionStorage.removeItem("stockmaster.accessToken");

        window.location.href = link.href;
    }
});
