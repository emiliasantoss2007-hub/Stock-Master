document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // IDENTIFICAÇÃO DA ORIGEM
    // ========================================

    const params = new URLSearchParams(window.location.search);
    const origem = params.get("origem");


    // ========================================
    // ELEMENTOS DA NAVEGAÇÃO
    // ========================================

    const dashboardLink = document.querySelector("#dashboardLink");
    const breadcrumbLink = document.querySelector("#breadcrumbLink");
    const produtosLink = document.querySelector("#produtosLink");
    const usuariosLink = document.querySelector("#usuariosLink");
    const entradaLink = document.querySelector("#entradaLink");
    const saidaLink = document.querySelector("#saidaLink");
    const expurgoLink = document.querySelector("#expurgoLink");
    const historicoLink = document.querySelector("#historicoLink");
    const relatoriosLink = document.querySelector("#relatoriosLink");
    const perfilLink = document.querySelector("#perfilLink");
    const produtosMenuText = document.querySelector("#produtosMenuText");

    const userRole = document.querySelector("#userRole");
    const username = document.querySelector("#username");
    const userAvatar = document.querySelector("#userAvatar");


    // ========================================
    // ADMINISTRADOR
    // ========================================

    if (origem !== "tecnico") {

        dashboardLink.href = "dashboard_adm.html";
        breadcrumbLink.href = "dashboard_adm.html";
        produtosLink.href = "produtos.html?origem=adm";
        produtosMenuText.textContent = "Produtos";

        entradaLink.href = "entrada_estoque.html?origem=adm";
        saidaLink.href = "saída_estoque.html?origem=adm";
        expurgoLink.href = "expurgo_estoque.html?origem=adm";
        historicoLink.href = "historico_movimentacao.html?origem=adm";
        relatoriosLink.href = "relatorios.html?origem=adm";
        perfilLink.href = "perfil.html?origem=adm";

        userRole.textContent = "Administrador";
        username.textContent = "admin.stockmaster";
        userAvatar.textContent = "AD";

        usuariosLink.style.display = "";
        expurgoLink.style.display = "";
        relatoriosLink.style.display = "";
    }


    // ========================================
    // TÉCNICO
    // ========================================

    if (origem === "tecnico") {

        dashboardLink.href = "dashboard_tec.html";
        breadcrumbLink.href = "dashboard_tec.html";
        produtosLink.href = "produtos.html?origem=tecnico";
        produtosMenuText.textContent = "Consultar produtos";

        entradaLink.href = "entrada_estoque.html?origem=tecnico";
        saidaLink.href = "saída_estoque.html?origem=tecnico";
        historicoLink.href = "historico_movimentacao.html?origem=tecnico";
        perfilLink.href = "perfil.html?origem=tecnico";

        userRole.textContent = "Técnico";
        username.textContent = "tecnico.stockmaster";
        userAvatar.textContent = "TC";

        usuariosLink.style.display = "none";
        expurgoLink.style.display = "none";
        relatoriosLink.style.display = "none";
    }


    // ========================================
    // CÓDIGO ESPECÍFICO DA PÁGINA
    // ========================================

    const mensagemDados = document.querySelector("#mensagemDados");
    const mensagemSenha = document.querySelector("#mensagemSenha");

    // Preenche os dados a partir do que a navegação já identificou (nome/login/perfil)
    document.querySelector("#perfilNome").value = userRole.textContent === "Administrador" ? "João Silva" : "Maria Souza";
    document.querySelector("#perfilLoginCampo").value = username.textContent;
    document.querySelector("#perfilEmail").value = `${username.textContent}@stockmaster.com`;
    document.querySelector("#perfilTipo").value = userRole.textContent;

    document.querySelector("#formDados").addEventListener("submit", (e) => {
        e.preventDefault();
        mensagemDados.innerHTML = "";

        const nome = document.querySelector("#perfilNome").value.trim();
        const email = document.querySelector("#perfilEmail").value.trim();
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!nome || !emailValido) {
            mensagemDados.innerHTML = `<p class="mensagem-erro">Preencha corretamente o nome e o e-mail.</p>`;
            return;
        }

        mensagemDados.innerHTML = `<p class="mensagem-sucesso">Dados atualizados com sucesso!</p>`;
    });

    document.querySelector("#formSenha").addEventListener("submit", (e) => {
        e.preventDefault();
        mensagemSenha.innerHTML = "";

        const nova = document.querySelector("#senhaNova").value;
        const confirmar = document.querySelector("#senhaConfirmar").value;

        if (nova.length < 6) {
            mensagemSenha.innerHTML = `<p class="mensagem-erro">A nova senha deve ter pelo menos 6 caracteres.</p>`;
            return;
        }

        if (nova !== confirmar) {
            mensagemSenha.innerHTML = `<p class="mensagem-erro">As senhas não coincidem.</p>`;
            return;
        }

        // Nesta Sprint 1 a senha não é persistida de fato (sem back-end/hash real ainda)
        mensagemSenha.innerHTML = `<p class="mensagem-sucesso">Senha alterada com sucesso!</p>`;
        document.querySelector("#formSenha").reset();
    });

});