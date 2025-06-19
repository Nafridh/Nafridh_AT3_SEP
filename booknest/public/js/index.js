//const express = require("express");
//const cors = require("cors");
//const sqlite3 = require("sqlite3").verbose();
//const path = require("path");

//const app = express();

// Middleware
//app.use(cors());
//app.use(express.json());
//app.use(express.static(path.join(__dirname, "public")));  // Serve static files

// Serve index.html
//app.get("/", (req, res) => {
//    res.sendFile(path.join(__dirname, "public/index.html"));
//});

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Loaded user from localStorage:", user);
    if (user && user.first_name) {
    document.getElementById('navUserName').textContent = `Welcome, ${user.first_name}`;
        } else {
                window.location.href = 'login.html';
            }

            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            });
        });

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Optional: Clear any stored auth data
            localStorage.removeItem("user");  // or sessionStorage.clear(), etc.
            // Redirect to login page
            window.location.href = "login.html";
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        window.location.href = 'login.html';
        return;
    }

    // Greet user
    document.getElementById('firstName').textContent = user.first_name;
    document.getElementById('navUserName').textContent = `Hello, ${user.first_name}`;
    console.log("User total points:", user.total_points);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Load Poll Winner
    try {
        const res = await fetch('/api/poll-winner');
        const winner = await res.json();
        document.getElementById('winnerCard').innerHTML = `
            <img src="${winner.cover_url}" alt="${winner.title}" style="max-width:100px;" />
            <h4>${winner.title}</h4>
            <p><em>${winner.author}</em></p>
            <p>Votes: ${winner.votes}</p>
        `;
    } catch (err) {
        document.getElementById('winnerCard').textContent = 'No recent winner.';
    }

    // Load user points
    document.getElementById('userPoints').textContent = user.total_points || 0;

    // Load top guild
    try {
        const res = await fetch('/api/top-guild');
        const guild = await res.json();
        document.getElementById('topGuild').textContent = `${guild.name} – ${guild.points} points`;
    } catch (err) {
        document.getElementById('topGuild').textContent = 'No data yet.';
    }

    // Load quests preview (first 3)
    try {
        const res = await fetch('/api/quests');
        const quests = await res.json();
        const list = document.getElementById('questList');
        list.innerHTML = '';
        quests.slice(0, 3).forEach(q => {
            const li = document.createElement('li');
            li.textContent = q.title;
            list.appendChild(li);
        });
    } catch (err) {
        document.getElementById('questList').textContent = 'Unable to load quests.';
    }
});


// Connect to database
//const db = new sqlite3.Database("./datasource.db", sqlite3.OPEN_READWRITE, (err) => {
//    if (err) console.error("Database connection error:", err.message);
//    else console.log("✅ Connected to SQLite database.");
//});


// Start Server
//const PORT = 8000;
//app.listen(PORT, () => {
//    console.log(`🚀 Server is running on http://localhost:8000/`);
//});