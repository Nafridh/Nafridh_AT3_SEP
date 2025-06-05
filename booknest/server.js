const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8000;
const JWT_SECRET = "your_jwt_secret_key"; // Use env var in production

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Connect to DB
const db = new sqlite3.Database(path.join(__dirname, ".database", "database.db"), sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error("❌ DB connection failed:", err.message);
    else console.log("✅ Connected to SQLite database.");
});

// ====== JWT Middleware ======
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user_id = user.user_id;
        next();
    });
};

// ====== Routes ======

// Home + Static HTMLs
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/leaderboard.html", (req, res) => res.sendFile(path.join(__dirname, "public", "leaderboard.html")));
app.get("/voting.html", (req, res) => res.sendFile(path.join(__dirname, "public", "voting.html")));

// Register
app.post('/register', (req, res) => {
    const { email, first_name, last_name, password, is_admin, guild_id } = req.body;
    if (!email || !first_name || !last_name || !password || guild_id == null || is_admin == null)
        return res.status(400).json({ error: "Missing fields" });

    db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (user) return res.status(400).json({ error: "Email already registered" });

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: "Hash error" });

            db.run(`
                INSERT INTO Users (email, first_name, last_name, password, is_admin, guild_id, total_points)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            `, [email, first_name, last_name, hash, is_admin, guild_id], function (err) {
                if (err) return res.status(500).json({ error: "Registration failed" });
                return res.json({ success: true, user_id: this.lastID });
            });
        });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: "DB error" });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        bcrypt.compare(password, user.password, (err, result) => {
            if (!result) return res.status(400).json({ error: "Invalid credentials" });

            const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ success: true, user, token });
        });
    });
});

// Quests
app.get('/quests', (req, res) => {
    db.all(`SELECT quest_id, title, description, points FROM Quests`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json(rows);
    });
});

app.post('/complete-quest', authenticateToken, (req, res) => {
    const user_id = req.user_id;
    const { quest_id } = req.body;
    const date_completed = new Date().toISOString();

    if (!quest_id) return res.status(400).json({ error: "Missing quest_id" });

    db.get(`SELECT * FROM QuestCompletions WHERE user_id = ? AND quest_id = ?`, [user_id, quest_id], (err, row) => {
        if (row) return res.status(400).json({ error: "Quest already completed" });

        db.get(`SELECT points FROM Quests WHERE quest_id = ?`, [quest_id], (err, quest) => {
            if (!quest) return res.status(400).json({ error: "Invalid quest" });

            const points = quest.points;

            db.serialize(() => {
                db.run(`INSERT INTO QuestCompletions (user_id, quest_id) VALUES (?, ?)`, [user_id, quest_id]);
                db.run(`UPDATE Users SET total_points = total_points + ? WHERE user_id = ?`, [points, user_id]);
                db.get(`SELECT guild_id FROM Users WHERE user_id = ?`, [user_id], (err, userRow) => {
                    if (!userRow) return res.status(500).json({ error: "Guild lookup failed" });
                    db.run(`UPDATE Guilds SET total_points = total_points + ? WHERE guild_id = ?`, [points, userRow.guild_id]);
                });
                db.run(`INSERT INTO PointsLog (user_id, quest_id, points_earned, date_completed) VALUES (?, ?, ?, ?)`,
                    [user_id, quest_id, points, date_completed]);
                res.json({ success: true, pointsEarned: points });
            });
        });
    });
});

// Leaderboard
app.get("/leaderboard", (req, res) => {
    db.all(`SELECT name, total_points FROM Guilds ORDER BY total_points DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Voting System
// ✅ FINAL /api/active-poll route
app.get('/api/active-poll', (req, res) => {
    const pollQuery = `
    SELECT p.poll_id, p.title AS poll_title, p.description AS poll_description,
        b.book_id, b.title, b.author, b.description AS book_description, b.cover_url
    FROM Polls p
    JOIN Books b ON p.poll_id = b.poll_id
    WHERE p.is_active = 1
    `;

    db.all(pollQuery, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ message: 'No active poll' });

        const poll = {
            poll_id: rows[0].poll_id,
            title: rows[0].poll_title,
            description: rows[0].poll_description,
            books: rows.map(row => ({
                book_id: row.book_id,
                title: row.title,
                author: row.author,
                description: row.book_description,
                cover_url: row.cover_url
            }))
        };
        res.json(poll); // sends { poll_id, title, description, books: [...] }
    });
});

app.post('/api/vote', authenticateToken, (req, res) => {
    const user_id = req.user_id;
    const { book_id, poll_id } = req.body;

    if (!book_id || !poll_id) return res.status(400).json({ error: "Missing vote info" });

    db.get(`SELECT * FROM Votes WHERE user_id = ? AND poll_id = ?`, [user_id, poll_id], (err, row) => {
        if (row) return res.status(400).json({ error: 'Already voted in this poll' });

        db.run(`INSERT INTO Votes (user_id, book_id, poll_id) VALUES (?, ?, ?)`, [user_id, book_id, poll_id], function (err) {
            if (err) return res.status(500).json({ error: "Vote failed" });
            res.json({ success: true, vote_id: this.lastID });
        });
    });
});

app.get("/api/poll-results/:poll_id", (req, res) => {
    const poll_id = req.params.poll_id;
    const query = `
        SELECT b.title, COUNT(v.vote_id) AS votes
        FROM Votes v
        JOIN Books b ON v.book_id = b.book_id
        WHERE v.poll_id = ?
        GROUP BY v.book_id
        ORDER BY votes DESC
    `;

    db.all(query, [poll_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.get("/api/poll-winner", (req, res) => {
    const pollQuery = `
        SELECT poll_id FROM Polls
        WHERE is_active = 0
        ORDER BY poll_id DESC
        LIMIT 1;
    `;

    db.get(pollQuery, [], (err, poll) => {
        if (err || !poll) {
            return res.status(404).json({ error: "No past polls found." });
        }

        const resultsQuery = `
            SELECT b.title, b.author, b.cover_url, COUNT(v.vote_id) AS votes
            FROM Votes v
            JOIN Books b ON v.book_id = b.book_id
            WHERE v.poll_id = ?
            GROUP BY v.book_id
            ORDER BY votes DESC
            LIMIT 1;
        `;

        db.get(resultsQuery, [poll.poll_id], (err2, winner) => {
            if (err2 || !winner) {
                return res.status(404).json({ error: "No winner found." });
            }
            res.json(winner);
        });
    });
});
app.get('/api/top-guild', (req, res) => {
    db.get(`SELECT name, points FROM Guilds ORDER BY points DESC LIMIT 1`, (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: "No top guild found." });
        }
        res.json(row);
    });
});
app.get('/api/quests', (req, res) => {
    db.all(`SELECT title FROM Quests ORDER BY created_at DESC LIMIT 5`, (err, rows) => {
        if (err) return res.status(500).json({ error: "Could not fetch quests." });
        res.json(rows);
    });
});


// Error Handling
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 BookNest server running at http://localhost:8000`);
});
