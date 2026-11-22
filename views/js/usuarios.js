
document.addEventListener("DOMContentLoaded", () => {

    // Elementos da interface
    const searchInput = document.querySelector("#searchUser");
    const profileFilter = document.querySelector("#filterProfile");
    const statusFilter = document.querySelector("#filterStatus");
    const clearFiltersButton = document.querySelector("#clearFilters");

    const tableBody = document.querySelector("#usersTableBody");
    const usersCount = document.querySelector("#usersCount");
    const usersMessage = document.querySelector("#usersMessage");

    const emptyState = document.querySelector("#emptyState");
    const emptyStateTitle = document.querySelector("#emptyStateTitle");
    const emptyStateMessage = document.querySelector("#emptyStateMessage");

    const sortButtons = document.querySelectorAll(".sort-button");

    // Estado da consulta
    let sortColumn = "nome";
    let sortDirection = "asc";

    let usuarios = [];

    // Consulta os usuários no backend
    async function carregarUsuarios() {

        const token = sessionStorage.getItem("stockmaster.accessToken");

        if (!token) {
            mostrarErro("Sessão não encontrada. Faça login novamente.");
            return;
        }

        mostrarCarregamento();

        const parametros = new URLSearchParams({
            busca: searchInput.value.trim(),
            perfil: profileFilter.value,
            status: statusFilter.value,
            ordenarPor: sortColumn,
            direcao: sortDirection
        });

        try {

            const resposta = await fetch(`/usuarios?${parametros.toString()}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const resultado = await obterRespostaJson(resposta);

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Não foi possível consultar os usuários."
                );
            }

            usuarios = Array.isArray(resultado.usuarios)
                ? resultado.usuarios
                : [];

            renderizarTabela();

            atualizarIndicadoresOrdenacao();

            usersMessage.textContent = "";

        } catch (erro) {

            console.error("Erro ao consultar usuários:", erro);

            usuarios = [];
            tableBody.innerHTML = "";

            usersCount.textContent = "0 usuários";

            mostrarErro(erro.message);
        }
    }

    // Converte a resposta HTTP para JSON
    async function obterRespostaJson(resposta) {

        try {
            return await resposta.json();
        } catch {
            throw new Error("Resposta inválida recebida do servidor.");
        }
    }

    // Renderiza os usuários recebidos do backend
    function renderizarTabela() {

        tableBody.innerHTML = "";

        if (usuarios.length === 0) {
            mostrarEstadoVazio();
            return;
        }

        emptyState.hidden = true;

        usuarios.forEach((usuario) => {
            const linha = criarLinha(usuario);
            tableBody.appendChild(linha);
        });

        atualizarContador();
    }

    // Cria uma linha da tabela
    function criarLinha(usuario) {

        const linha = document.createElement("tr");

        const nome = usuario.nome || "";
        const email = usuario.email || "";
        const login = usuario.login || "";
        const perfil = usuario.perfil || "Não informado";

        const statusAtivo =
            usuario.status === 1 ||
            usuario.status === "1" ||
            usuario.status === true ||
            usuario.status === "Ativo";

        const statusTexto = statusAtivo ? "Ativo" : "Inativo";

        linha.dataset.name = nome;
        linha.dataset.id = usuario.id_usuario;
        linha.dataset.email = email;
        linha.dataset.login = login;
        linha.dataset.profile = perfil;
        linha.dataset.status = statusTexto;

        // Nome e avatar
        const celulaNome = document.createElement("td");

        const userCell = document.createElement("div");
        userCell.className = "user-cell";

        const avatar = document.createElement("span");
        avatar.className = "user-cell-avatar";
        avatar.textContent = obterIniciais(nome);

        const informacoes = document.createElement("div");

        const nomeElemento = document.createElement("strong");
        nomeElemento.textContent = nome;

        informacoes.appendChild(nomeElemento);
        userCell.appendChild(avatar);
        userCell.appendChild(informacoes);
        celulaNome.appendChild(userCell);

        // E-mail
        const celulaEmail = document.createElement("td");
        celulaEmail.textContent = email;

        // Login
        const celulaLogin = document.createElement("td");
        celulaLogin.textContent = login;

        // Perfil
        const celulaPerfil = document.createElement("td");
        celulaPerfil.textContent = perfil;

        // Status
        const celulaStatus = document.createElement("td");

        const statusElemento = document.createElement("span");
        statusElemento.className = statusAtivo
            ? "status status-success"
            : "status status-danger";

        statusElemento.textContent = statusTexto;

        celulaStatus.appendChild(statusElemento);

        // Ações
        const celulaAcoes = document.createElement("td");
        const acoes = document.createElement("div");

        acoes.className = "table-actions";

        const botaoEditar = document.createElement("a");
        botaoEditar.className = "table-action table-action-edit";
        botaoEditar.textContent = "Editar";
        botaoEditar.href = `editar_usuario.html?id=${encodeURIComponent(usuario.id_usuario)}`;

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "table-action table-action-delete delete-user";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.dataset.user = nome;

        // Mantém o comportamento de exclusão exclusivamente visual
        botaoExcluir.addEventListener("click", () => {
            excluirVisualmente(linha, nome);
        });

        acoes.appendChild(botaoEditar);
        acoes.appendChild(botaoExcluir);

        celulaAcoes.appendChild(acoes);

        // Montagem da linha
        linha.appendChild(celulaNome);
        linha.appendChild(celulaEmail);
        linha.appendChild(celulaLogin);
        linha.appendChild(celulaPerfil);
        linha.appendChild(celulaStatus);
        linha.appendChild(celulaAcoes);

        return linha;
    }

    // Obtém as iniciais para o avatar
    function obterIniciais(nome) {

        if (!nome) {
            return "US";
        }

        return nome
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte.charAt(0).toUpperCase())
            .join("");
    }

    // Mantém a exclusão visual já existente
    function excluirVisualmente(linha, nome) {

        const confirmado = window.confirm(
            `Deseja excluir o usuário ${nome}?`
        );

        if (!confirmado) {
            return;
        }

        linha.remove();

        usuarios = usuarios.filter(
            (usuario) => String(usuario.id_usuario) !==
                String(linha.dataset.id)
        );

        atualizarContador();

        if (tableBody.children.length === 0) {
            mostrarEstadoVazio();
        }

        usersMessage.textContent =
            `Usuário ${nome} excluído visualmente.`;
    }

    // Exibe o estado vazio da tabela
    function mostrarEstadoVazio() {

        emptyState.hidden = false;

        emptyStateTitle.textContent = "Nenhum usuário encontrado";

        emptyStateMessage.textContent =
            "Não existem usuários correspondentes aos filtros selecionados.";

        usersCount.textContent = "0 usuários";
    }

    // Exibe o carregamento
    function mostrarCarregamento() {

        tableBody.innerHTML = "";

        emptyState.hidden = true;

        usersCount.textContent = "Carregando...";

        usersMessage.textContent = "Consultando usuários...";
    }

    // Exibe mensagens de erro
    function mostrarErro(mensagem) {

        emptyState.hidden = false;

        emptyStateTitle.textContent = "Não foi possível carregar os usuários";

        emptyStateMessage.textContent = mensagem;

        usersMessage.textContent = mensagem;
    }

    // Atualiza o contador de usuários
    function atualizarContador() {

        const quantidade = tableBody.children.length;

        usersCount.textContent =
            `${quantidade} usuário(s)`;
    }

    // Atualiza os indicadores de ordenação
    function atualizarIndicadoresOrdenacao() {

        sortButtons.forEach((botao) => {

            const indicador = botao.querySelector(".sort-indicator");

            const coluna = botao.dataset.sort;

            if (coluna === sortColumn) {

                indicador.textContent =
                    sortDirection === "asc" ? " ↑" : " ↓";

                botao.setAttribute("aria-sort",
                    sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                );

            } else {

                indicador.textContent = "";

                botao.removeAttribute("aria-sort");
            }
        });
    }

    // Eventos dos filtros
    searchInput.addEventListener("input", carregarUsuarios);

    profileFilter.addEventListener("change", carregarUsuarios);

    statusFilter.addEventListener("change", carregarUsuarios);

    // Limpa todos os filtros
    clearFiltersButton.addEventListener("click", () => {

        searchInput.value = "";
        profileFilter.value = "";
        statusFilter.value = "";

        carregarUsuarios();
    });

    // Eventos de ordenação
    sortButtons.forEach((botao) => {

        botao.addEventListener("click", () => {

            const colunaSelecionada = botao.dataset.sort;

            if (sortColumn === colunaSelecionada) {

                sortDirection =
                    sortDirection === "asc" ? "desc" : "asc";

            } else {

                sortColumn = colunaSelecionada;
                sortDirection = "asc";
            }

            carregarUsuarios();
        });
    });

    // Carrega os usuários assim que a página é aberta
    carregarUsuarios();

});