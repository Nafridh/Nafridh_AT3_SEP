const express = require("express");
    const path = require("path");
    const app = express();
    app.use(express.static(path.join(__dirname,"public")));
    app.get("/", function (req, res) {res.sendFile(path.join(__dirname,"public/index.html"));});

    app.listen(8000, () => console.log("Snape Server is running on Port 8000, visit http://localhost:8000/or http://127.0.0.1:8000 to access your website") );

// Get leaderboard
app.get('/leaderboard', (req, res) => {
db.all(`SELECT name, total_points FROM Guilds ORDER BY total_points DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
});
});

    document.addEventListener("DOMContentLoaded", () => {
    fetch('/leaderboard')
        .then(res => res.json())
        .then(data => {
    const list = document.getElementById('leaderboard');
    data.forEach((guild, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${guild.name} — ${guild.total_points} points`;
        list.appendChild(li);
        });
    })
    .catch(err => {
        console.error('Error loading leaderboard:', err);
    });
});