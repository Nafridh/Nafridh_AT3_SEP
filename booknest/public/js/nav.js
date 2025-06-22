document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navUserName = document.getElementById("navUserName");
    const logoutBtn = document.getElementById("logoutBtn");

    // Map guild_id to name
    const guilds = {
        1: "Shadow Seekers",
        2: "Blazing Guardians",
        3: "Verdant Wanderers",
        4: "Galaxy Crusaders"
    };

    if (user && navUserName) {
        const firstName = user.first_name;
        const guildName = guilds[user.guild_id] || "Unknown Guild";

        navUserName.textContent = `Hello ${firstName} of ${guildName}`;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login.html";
        });
    }
});
