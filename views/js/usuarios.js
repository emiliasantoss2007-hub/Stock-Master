document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("#searchUser");
    const profileFilter = document.querySelector("#filterProfile");
    const statusFilter = document.querySelector("#filterStatus");
    const rows = Array.from(document.querySelectorAll("#usersTableBody tr"));
    const usersCount = document.querySelector("#usersCount");
    const usersMessage = document.querySelector("#usersMessage");
    const deleteButtons = document.querySelectorAll(".delete-user");

    function filterUsers() {
        const search = searchInput.value.trim().toLowerCase();
        const profile = profileFilter.value;
        const status = statusFilter.value;
        let visibleRows = 0;

        rows.forEach((row) => {
            const content = row.textContent.toLowerCase();
            const matchesSearch = !search || content.includes(search);
            const matchesProfile = !profile || row.dataset.profile === profile;
            const matchesStatus = !status || row.dataset.status === status;
            const shouldShow = matchesSearch && matchesProfile && matchesStatus;

            row.hidden = !shouldShow;

            if (shouldShow) {
                visibleRows += 1;
            }
        });

        usersCount.textContent = `${visibleRows} usuário(s)`;
        usersMessage.textContent = visibleRows === 0
            ? "Nenhum usuário encontrado para os filtros informados."
            : "";
    }

    searchInput.addEventListener("input", filterUsers);
    profileFilter.addEventListener("change", filterUsers);
    statusFilter.addEventListener("change", filterUsers);

    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const userName = button.dataset.user;
            const confirmed = window.confirm(`Deseja excluir o usuário ${userName}?`);

            if (!confirmed) {
                return;
            }

            button.closest("tr").remove();
            filterUsers();
            usersMessage.textContent = `Usuário ${userName} excluído visualmente.`;
        });
    });
});