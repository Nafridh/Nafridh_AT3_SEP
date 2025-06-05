document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navUserName = document.getElementById("navUserName");
    const logoutBtn = document.getElementById("logoutBtn");

    if (user && navUserName) {
        navUserName.textContent = `Hello, ${user.first_name}`;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login.html";
        });
    }
});
