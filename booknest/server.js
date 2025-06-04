const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, ".database", "database.db"), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("❌ Failed to connect to database:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/leaderboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "leaderboard.html"));
});

app.get("/leaderboard", (req, res) => {
    db.all(`SELECT name, total_points FROM Guilds ORDER BY total_points DESC`, [], (err, rows) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:8000`);
});
