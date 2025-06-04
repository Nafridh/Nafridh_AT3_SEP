const express = require("express");
    const path = require("path");
    const app = express();
    app.use(express.static(path.join(__dirname,"public/js")));
    app.get("/", function (req, res) {res.sendFile(path.join(__dirname,"index.html"));});
    app.get("/", function (req, res) {res.sendFile(path.join(__dirname,"leaderboard.html"));});
    app.listen(8000, () => console.log("Server is running on haha Port 8000, visit http://localhost:8000/ or http://127.0.0.1:8000 to access your website") );


// Get leaderboard
app.get('/leaderboard', (req, res) => {
db.all(`SELECT name, total_points FROM Guilds ORDER BY total_points DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
});
});

