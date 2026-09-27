document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * =====================================================
         * ELEMENTOS DA INTERFACE
         * =====================================================
         */

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


        /*
         * =====================================================
         * ESTADO DA TELA
         * =====================================================
         */

        let users = [];

        let filteredUsers = [];

        let sortColumn = "nome";

        let sortDirection = "asc";


        /*
         * =====================================================
         * INICIALIZAÇÃO
         * =====================================================
         */

        carregarUsuarios();


        /*
         * =====================================================
         * EVENTOS
         * =====================================================
         */

        searchInput.addEventListener(
            "input",
            aplicarFiltros
        );


        profileFilter.addEventListener(
            "change",
            aplicarFiltros
        );


        statusFilter.addEventListener(
            "change",
            aplicarFiltros
        );


        clearFiltersButton.addEventListener(
            "click",
            () => {

                searchInput.value = "";

                profileFilter.value = "";

                statusFilter.value = "";

                aplicarFiltros();

                searchInput.focus();

            }
        );


        /*
         * Ordenação das colunas.
         */

        sortButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const column =
                            button.dataset.sort;


                        if (
                            sortColumn === column
                        ) {

                            sortDirection =
                                sortDirection === "asc"
                                    ? "desc"
                                    : "asc";

                        } else {

                            sortColumn =
                                column;

                            sortDirection =
                                "asc";

                        }


                        atualizarIndicadoresOrdenacao();

                        aplicarFiltros();

                    }
                );

            }
        );


        /*
         * =====================================================
         * CARREGAR USUÁRIOS
         * =====================================================
         *
         * GET /api/usuarios
         *
         * Controller:
         * listarUsuarios()
         *
         */

        async function carregarUsuarios() {

            mostrarCarregando();


            try {

                /*
                 * Perfil utilizado pelo protótipo
                 * atual para compatibilidade com
                 * o Controller.
                 */
                const perfil =
                    localStorage.getItem(
                        "perfil"
                    ) ||
                    "Administrador";


                const resposta =
                    await fetch(
                        "/api/usuarios",
                        {

                            method: "GET",

                            headers: {

                                "X-Perfil":
                                    perfil

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
                        "Não foi possível carregar os usuários."
                    );

                }


                /*
                 * Garante que a resposta
                 * possua uma lista.
                 */
                if (
                    !Array.isArray(
                        dados.usuarios
                    )
                ) {

                    throw new Error(
                        "O servidor retornou uma lista de usuários inválida."
                    );

                }


                /*
                 * Normaliza os registros
                 * vindos do banco.
                 */
                users =
                    dados.usuarios.map(
                        normalizarUsuario
                    );


                aplicarFiltros();


            } catch (erro) {

                console.error(
                    "Erro ao carregar usuários:",
                    erro
                );


                users = [];

                filteredUsers = [];


                renderizarTabela();


                usersCount.textContent =
                    "0 usuários";


                emptyState.hidden =
                    false;


                emptyStateTitle.textContent =
                    "Não foi possível carregar os usuários";


                emptyStateMessage.textContent =
                    erro.message ||
                    "Verifique a conexão com o servidor e tente novamente.";


                usersMessage.textContent =
                    "";

            }

        }


        /*
         * =====================================================
         * NORMALIZAÇÃO DO USUÁRIO
         * =====================================================
         */

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


        /*
         * =====================================================
         * NORMALIZAÇÃO DO STATUS
         * =====================================================
         */

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


        /*
         * =====================================================
         * PESQUISA E FILTROS
         * =====================================================
         */

        function aplicarFiltros() {

            const pesquisa =
                normalizarTexto(
                    searchInput.value
                );


            const perfil =
                profileFilter.value;


            const status =
                statusFilter.value;


            filteredUsers =
                users.filter(
                    (usuario) => {

                        /*
                         * Pesquisa por:
                         * nome
                         * e-mail
                         * login
                         */

                        const correspondePesquisa =
                            !pesquisa ||
                            normalizarTexto(
                                usuario.nome
                            ).includes(
                                pesquisa
                            ) ||
                            normalizarTexto(
                                usuario.email
                            ).includes(
                                pesquisa
                            ) ||
                            normalizarTexto(
                                usuario.login
                            ).includes(
                                pesquisa
                            );


                        /*
                         * Filtro por perfil.
                         */

                        const correspondePerfil =
                            !perfil ||
                            usuario.perfil ===
                                perfil;


                        /*
                         * Filtro por status.
                         */

                        const correspondeStatus =
                            !status ||
                            usuario.status ===
                                status;


                        return (
                            correspondePesquisa &&
                            correspondePerfil &&
                            correspondeStatus
                        );

                    }
                );


            ordenarUsuarios(
                filteredUsers
            );


            renderizarTabela();

        }


        /*
         * =====================================================
         * ORDENAÇÃO
         * =====================================================
         */

        function ordenarUsuarios(
            lista
        ) {

            lista.sort(
                (a, b) => {

                    const valorA =
                        obterValorOrdenacao(
                            a,
                            sortColumn
                        );


                    const valorB =
                        obterValorOrdenacao(
                            b,
                            sortColumn
                        );


                    const comparacao =
                        valorA.localeCompare(
                            valorB,
                            "pt-BR",
                            {
                                numeric: true,
                                sensitivity:
                                    "base"
                            }
                        );


                    return (
                        sortDirection ===
                        "asc"
                    )
                        ? comparacao
                        : -comparacao;

                }
            );

        }


        /*
         * Obtém o valor utilizado
         * na ordenação.
         */

        function obterValorOrdenacao(
            usuario,
            coluna
        ) {

            if (
                coluna ===
                "status"
            ) {

                return usuario.status;

            }


            return (
                usuario[coluna] ||
                ""
            );

        }


        /*
         * =====================================================
         * RENDERIZAR TABELA
         * =====================================================
         */

        function renderizarTabela() {

            tableBody.innerHTML =
                "";


            /*
             * Nenhum resultado.
             */

            if (
                filteredUsers.length ===
                0
            ) {

                usersCount.textContent =
                    "0 usuários";


                emptyState.hidden =
                    false;


                const possuiFiltros =
                    searchInput.value.trim() ||
                    profileFilter.value ||
                    statusFilter.value;


                emptyStateTitle.textContent =
                    possuiFiltros
                        ? "Nenhum usuário encontrado"
                        : "Nenhum usuário cadastrado";


                emptyStateMessage.textContent =
                    possuiFiltros
                        ? "Não há usuários que correspondam aos critérios informados."
                        : "Os usuários cadastrados aparecerão nesta tabela.";


                return;

            }


            emptyState.hidden =
                true;


            usersCount.textContent =
                `${filteredUsers.length} ${
                    filteredUsers.length === 1
                        ? "usuário"
                        : "usuários"
                }`;


            const fragment =
                document.createDocumentFragment();


            filteredUsers.forEach(
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


        /*
         * =====================================================
         * CRIAR LINHA DA TABELA
         * =====================================================
         */

        function criarLinha(
            usuario
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            /*
             * NOME
             */

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


            /*
             * E-MAIL
             */

            const emailCell =
                criarCelulaTexto(
                    usuario.email
                );


            /*
             * LOGIN
             */

            const loginCell =
                criarCelulaTexto(
                    usuario.login
                );


            /*
             * PERFIL
             */

            const perfilCell =
                criarCelulaTexto(
                    usuario.perfil
                );


            /*
             * STATUS
             */

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


            /*
             * AÇÕES
             */

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
                `editar_usuario.html?id=${
                    encodeURIComponent(
                        usuario.id
                    )
                }`;


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


            /*
             * Adiciona todas as células.
             */

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


        /*
         * =====================================================
         * CRIAR CÉLULA
         * =====================================================
         */

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


        /*
         * =====================================================
         * INICIAIS DO USUÁRIO
         * =====================================================
         */

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


        /*
         * =====================================================
         * INDICADORES DE ORDENAÇÃO
         * =====================================================
         */

        function atualizarIndicadoresOrdenacao() {

            sortButtons.forEach(
                (button) => {

                    const indicator =
                        button.querySelector(
                            ".sort-indicator"
                        );


                    const isActive =
                        button.dataset.sort ===
                        sortColumn;


                    button.setAttribute(
                        "aria-sort",
                        isActive
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
                            isActive
                                ? sortDirection ===
                                  "asc"
                                    ? "↑"
                                    : "↓"
                                : "↕";

                    }

                }
            );

        }


        /*
         * =====================================================
         * NORMALIZAÇÃO DA PESQUISA
         * ===================================================== */

        function normalizarTexto(
            valor
        ) {

            return String(
                valor ||
                ""
            )
                .toLocaleLowerCase(
                    "pt-BR"
                )
                .normalize(
                    "NFD"
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

        }


        /*
         * =====================================================
         * ESTADO DE CARREGAMENTO
         * =====================================================
         */

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


        /*
         * =====================================================
         * LEITURA DA RESPOSTA DA API
         * =====================================================
         */

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

            } catch (erro) {

                throw new Error(
                    "O servidor retornou uma resposta inválida."
                );

            }

        }


        /*
         * Inicializa os indicadores.
         */

        atualizarIndicadoresOrdenacao();

    }
);