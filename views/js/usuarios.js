document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ELEMENTOS

        const searchInput =
            document.querySelector(
                "#searchUser"
            );

        const profileFilter =
            document.querySelector(
                "#filterProfile"
            );

        const statusFilter =
            document.querySelector(
                "#filterStatus"
            );

        const clearFiltersButton =
            document.querySelector(
                "#clearFilters"
            );

        const tableBody =
            document.querySelector(
                "#usersTableBody"
            );

        const usersCount =
            document.querySelector(
                "#usersCount"
            );

        const usersMessage =
            document.querySelector(
                "#usersMessage"
            );

        const emptyState =
            document.querySelector(
                "#emptyState"
            );

        const emptyStateTitle =
            document.querySelector(
                "#emptyStateTitle"
            );

        const emptyStateMessage =
            document.querySelector(
                "#emptyStateMessage"
            );

        const sortButtons =
            document.querySelectorAll(
                ".sort-button"
            );


        // ESTADO

        let users = [];

        let sortColumn = "nome";

        let sortDirection = "asc";


        // INICIALIZAÇÃO

        carregarUsuarios();


        // PESQUISA

        searchInput.addEventListener(
            "input",
            () => {

                carregarUsuarios();

            }
        );


        // FILTRO DE PERFIL

        profileFilter.addEventListener(
            "change",
            () => {

                carregarUsuarios();

            }
        );


        // FILTRO DE STATUS

        statusFilter.addEventListener(
            "change",
            () => {

                carregarUsuarios();

            }
        );


        // LIMPAR FILTROS

        clearFiltersButton.addEventListener(
            "click",
            () => {

                searchInput.value = "";

                profileFilter.value = "";

                statusFilter.value = "";

                carregarUsuarios();

                searchInput.focus();

            }
        );


        // ORDENAÇÃO

        sortButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const column =
                            button.dataset.sort;

                        if (
                            sortColumn ===
                            column
                        ) {

                            sortDirection =
                                sortDirection ===
                                "asc"
                                    ? "desc"
                                    : "asc";

                        } else {

                            sortColumn =
                                column;

                            sortDirection =
                                "asc";

                        }

                        atualizarIndicadoresOrdenacao();

                        carregarUsuarios();

                    }
                );

            }
        );


        // CONSULTAR USUÁRIOS

        async function carregarUsuarios() {

            mostrarCarregando();

            try {

                const parametros =
                    new URLSearchParams();

                const busca =
                    searchInput.value.trim();

                const perfil =
                    profileFilter.value;

                const status =
                    statusFilter.value;


                if (busca) {

                    parametros.set(
                        "busca",
                        busca
                    );

                }


                if (perfil) {

                    parametros.set(
                        "perfil",
                        perfil
                    );

                }


                if (status) {

                    parametros.set(
                        "status",
                        status
                    );

                }


                parametros.set(
                    "ordenarPor",
                    sortColumn
                );


                parametros.set(
                    "direcao",
                    sortDirection
                );


                // AUTENTICAÇÃO DE TESTE

                const perfilLogado =
                    localStorage.getItem(
                        "perfil"
                    ) ||
                    "Administrador";


                const usuarioTeste = {

                    id_nivel_acesso:
                        perfilLogado ===
                        "Administrador"
                            ? 1
                            : 2

                };


                const resposta =
                    await fetch(
                        `/api/usuarios?${parametros.toString()}`,
                        {
                            method: "GET",

                            headers: {

                                "X-User":
                                    JSON.stringify(
                                        usuarioTeste
                                    )

                            }
                        }
                    );


                const dados =
                    await obterRespostaJson(
                        resposta
                    );


                if (
                    !resposta.ok
                ) {

                    throw new Error(
                        dados.mensagem ||
                        "Não foi possível consultar os usuários."
                    );

                }


                if (
                    !dados.sucesso
                ) {

                    throw new Error(
                        dados.mensagem ||
                        "A consulta não foi realizada."
                    );

                }


                if (
                    !Array.isArray(
                        dados.usuarios
                    )
                ) {

                    throw new Error(
                        "O servidor retornou dados inválidos."
                    );

                }


                users =
                    dados.usuarios.map(
                        normalizarUsuario
                    );


                renderizarTabela();


            } catch (erro) {

                console.error(
                    "Erro na consulta:",
                    erro
                );


                users = [];


                tableBody.innerHTML =
                    "";


                usersCount.textContent =
                    "0 usuários";


                emptyState.hidden =
                    false;


                emptyStateTitle.textContent =
                    "Não foi possível carregar os usuários";


                emptyStateMessage.textContent =
                    erro.message ||
                    "Verifique a conexão com o servidor.";


                usersMessage.textContent =
                    "";

            }

        }


        // NORMALIZAR USUÁRIO

        function normalizarUsuario(
            usuario
        ) {

            return {

                id:
                    Number(
                        usuario.id_usuario
                    ),

                nome:
                    String(
                        usuario.nome ||
                        ""
                    ),

                email:
                    String(
                        usuario.email ||
                        ""
                    ),

                login:
                    String(
                        usuario.login ||
                        ""
                    ),

                perfil:
                    String(
                        usuario.perfil ||
                        ""
                    ),

                status:
                    normalizarStatus(
                        usuario.status
                    )

            };

        }


        // NORMALIZAR STATUS

        function normalizarStatus(
            status
        ) {

            return (
                status === true ||
                status === 1 ||
                status === "1" ||
                String(
                    status
                ).toLowerCase() ===
                "true"
            )
                ? "Ativo"
                : "Inativo";

        }


        // RENDERIZAR TABELA

        function renderizarTabela() {

            tableBody.innerHTML =
                "";


            if (
                users.length === 0
            ) {

                usersCount.textContent =
                    "0 usuários";


                emptyState.hidden =
                    false;


                emptyStateTitle.textContent =
                    "Nenhum usuário encontrado";


                emptyStateMessage.textContent =
                    "Não há usuários que correspondam aos critérios informados.";


                usersMessage.textContent =
                    "";


                return;

            }


            emptyState.hidden =
                true;


            usersCount.textContent =
                `${users.length} ${
                    users.length === 1
                        ? "usuário"
                        : "usuários"
                }`;


            const fragment =
                document.createDocumentFragment();


            users.forEach(
                (usuario) => {

                    fragment.appendChild(
                        criarLinha(
                            usuario
                        )
                    );

                }
            );


            tableBody.appendChild(
                fragment
            );


            usersMessage.textContent =
                "";

        }


        // CRIAR LINHA

        function criarLinha(
            usuario
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            // NOME

            const nomeCell =
                document.createElement(
                    "td"
                );


            const userCell =
                document.createElement(
                    "div"
                );

            userCell.className =
                "user-cell";


            const avatar =
                document.createElement(
                    "span"
                );

            avatar.className =
                "user-cell-avatar";


            avatar.textContent =
                obterIniciais(
                    usuario.nome
                );


            avatar.setAttribute(
                "aria-hidden",
                "true"
            );


            const userInfo =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                usuario.nome ||
                "—";


            userInfo.appendChild(
                name
            );


            userCell.appendChild(
                avatar
            );

            userCell.appendChild(
                userInfo
            );


            nomeCell.appendChild(
                userCell
            );


            // E-MAIL

            const emailCell =
                criarCelulaTexto(
                    usuario.email
                );


            // LOGIN

            const loginCell =
                criarCelulaTexto(
                    usuario.login
                );


            // PERFIL

            const perfilCell =
                criarCelulaTexto(
                    usuario.perfil
                );


            // STATUS

            const statusCell =
                document.createElement(
                    "td"
                );


            const statusBadge =
                document.createElement(
                    "span"
                );


            statusBadge.className =
                usuario.status ===
                "Ativo"
                    ? "status status-success"
                    : "status status-danger";


            statusBadge.textContent =
                usuario.status;


            statusCell.appendChild(
                statusBadge
            );


            // AÇÕES

            const actionsCell =
                document.createElement(
                    "td"
                );


            actionsCell.className =
                "actions-cell";


            const editLink =
                document.createElement(
                    "a"
                );


            editLink.href =
                `editar_usuario.html?id=${encodeURIComponent(
                    usuario.id
                )}`;


            editLink.className =
                "table-action table-action-edit";


            editLink.textContent =
                "Editar";


            editLink.setAttribute(
                "aria-label",
                `Editar usuário ${usuario.nome}`
            );


            actionsCell.appendChild(
                editLink
            );


            row.append(
                nomeCell,
                emailCell,
                loginCell,
                perfilCell,
                statusCell,
                actionsCell
            );


            return row;

        }


        // CRIAR CÉLULA

        function criarCelulaTexto(
            valor
        ) {

            const cell =
                document.createElement(
                    "td"
                );


            cell.textContent =
                valor ||
                "—";


            return cell;

        }


        // INICIAIS

        function obterIniciais(
            nome
        ) {

            const partes =
                nome
                    .trim()
                    .split(/\s+/)
                    .filter(
                        Boolean
                    );


            if (
                partes.length ===
                0
            ) {

                return "U";

            }


            if (
                partes.length ===
                1
            ) {

                return partes[0]
                    .substring(
                        0,
                        2
                    )
                    .toUpperCase();

            }


            return (
                partes[0][0] +
                partes[
                    partes.length - 1
                ][0]
            ).toUpperCase();

        }


        // ORDENAÇÃO

        function atualizarIndicadoresOrdenacao() {

            sortButtons.forEach(
                (button) => {

                    const indicator =
                        button.querySelector(
                            ".sort-indicator"
                        );


                    const ativo =
                        button.dataset.sort ===
                        sortColumn;


                    button.setAttribute(
                        "aria-sort",
                        ativo
                            ? sortDirection ===
                                "asc"
                                ? "ascending"
                                : "descending"
                            : "none"
                    );


                    if (
                        indicator
                    ) {

                        indicator.textContent =
                            ativo
                                ? sortDirection ===
                                    "asc"
                                    ? "↑"
                                    : "↓"
                                : "↕";

                    }

                }
            );

        }


        // CARREGANDO

        function mostrarCarregando() {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="table-loading"
                    >
                        Carregando usuários...
                    </td>
                </tr>
            `;


            emptyState.hidden =
                true;


            usersCount.textContent =
                "Carregando...";

        }


        // LER JSON

        async function obterRespostaJson(
            resposta
        ) {

            const texto =
                await resposta.text();


            if (
                !texto
            ) {

                return {};

            }


            try {

                return JSON.parse(
                    texto
                );

            } catch (
                erro
            ) {

                throw new Error(
                    "O servidor retornou uma resposta inválida."
                );

            }

        }


        atualizarIndicadoresOrdenacao();

    }
);