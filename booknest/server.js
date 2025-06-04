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

app.get('/quests', (req, res) => {
    db.all(`SELECT quest_id, title, points FROM Quests`, [], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching quests:", err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
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

app.get('/quests', (req, res) => {
    db.all(`SELECT quest_id, title, points FROM Quests`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/complete-quest', (req, res) => {
    const { user_id, quest_id } = req.body;

    // Step 1: Get quest point value
    db.get(`SELECT points FROM Quests WHERE quest_id = ?`, [quest_id], (err, quest) => {
        if (err || !quest) return res.status(400).json({ error: "Invalid quest" });

        const points = quest.points;
        const date_completed = new Date().toISOString();

        // Step 2: Insert into PointLogger
        db.run(`INSERT INTO PointLogger (user_id, quest_id, points_earned, date_completed)
                VALUES (?, ?, ?, ?)`, [user_id, quest_id, points, date_completed], function(err) {

            if (err) return res.status(500).json({ error: "Failed to log completion" });

            // Step 3: Update user's personal points
            db.run(`UPDATE Users SET points = points + ? WHERE user_id = ?`,
                [points, user_id], function(err) {
                if (err) return res.status(500).json({ error: "Failed to update user points" });

                // Step 4: Get user's guild
                db.get(`SELECT guild_id FROM Users WHERE user_id = ?`, [user_id], (err, userRow) => {
                    if (err || !userRow) return res.status(500).json({ error: "User not found" });

                    // Step 5: Update guild's points
                    db.run(`UPDATE Guilds SET total_points = total_points + ? WHERE guild_id = ?`,
                        [points, userRow.guild_id], function(err) {
                        if (err) return res.status(500).json({ error: "Failed to update guild points" });

                        // ✅ All done!
                        res.json({ message: "Quest completed successfully", pointsEarned: points });
                    });
                });
            });
        });
    });
});

app.post('/complete-quest', (req, res) => {
    const { user_id, quest_id, points } = req.body;

    if (!user_id || !quest_id || !points) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if quest was already completed
    db.get(`SELECT * FROM QuestCompletions WHERE user_id = ? AND quest_id = ?`, [user_id, quest_id], (err, row) => {
        if (row) {
            return res.status(400).json({ error: "Quest already completed" });
        }

        db.serialize(() => {
            // 1. Log the quest
            db.run(`INSERT INTO QuestCompletions (user_id, quest_id) VALUES (?, ?)`, [user_id, quest_id]);

            // 2. Update user points
            db.run(`UPDATE Users SET points = points + ? WHERE user_id = ?`, [points, user_id]);

            // 3. Update guild points
            db.get(`SELECT guild_id FROM Users WHERE user_id = ?`, [user_id], (err, row) => {
                if (row) {
                    db.run(`UPDATE Guilds SET total_points = total_points + ? WHERE guild_id = ?`, [points, row.guild_id]);
                }
            });

            res.json({ success: true });
        });
    });
});

app.get('/quests', (req, res) => {
    db.all(`SELECT quest_id, title, points FROM Quests`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:8000`);
});
