document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Store JWT token in localStorage
                localStorage.setItem("token", data.token);
                // Optionally store user info
                localStorage.setItem("user", JSON.stringify(data.user));
                // Redirect to quest page or home page
                window.location.href = "/index.html";
            } else {
                errorMsg.textContent = data.error || "Login failed";
            }
        } catch (err) {
            errorMsg.textContent = "Network error";
            console.error("Login error:", err);
        }
    });
});
