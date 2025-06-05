document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        guild_id: parseInt(document.getElementById('guild').value),
        is_admin: parseInt(document.getElementById('role').value),
        };

        const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
        alert("✅ Registration successful!");
        window.location.href = "login.html";
        } else {
        alert("❌ " + result.error);
        }
    });