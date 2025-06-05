const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const JWT_SECRET = "your_jwt_secret_key"; // Replace with a secure key in production

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
    db.all(`SELECT quest_id, title, description, points FROM Quests`, [], (err, rows) => {
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
    db.all(`SELECT quest_id, title, description, points FROM Quests`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Middleware to verify JWT token and extract user_id
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

app.post('/complete-quest', authenticateToken, (req, res) => {
    console.log("Received /complete-quest request with user_id:", req.user_id, "and body:", req.body);
    const user_id = req.user_id;
    const { quest_id } = req.body;

    if (!quest_id) {
        console.log("Missing quest_id in /complete-quest request body");
        return res.status(400).json({ error: "Missing quest_id" });
    }

    // Check if quest was already completed
    db.get(`SELECT * FROM QuestCompletions WHERE user_id = ? AND quest_id = ?`, [user_id, quest_id], (err, row) => {
        if (row) {
            return res.status(400).json({ error: "Quest already completed" });
        }

        // Get quest points
        db.get(`SELECT points FROM Quests WHERE quest_id = ?`, [quest_id], (err, quest) => {
            if (err || !quest) {
                return res.status(400).json({ error: "Invalid quest" });
            }

            const points = quest.points;
            const date_completed = new Date().toISOString();

            db.serialize(() => {
                // 1. Log the quest
                db.run(`INSERT INTO QuestCompletions (user_id, quest_id) VALUES (?, ?)`, [user_id, quest_id], function(err) {
                    if (err) {
                        console.error("Failed to log quest completion:", err.message);
                        return res.status(500).json({ error: "Failed to log completion" });
                    }

                    // 2. Update user points
                    db.run(`UPDATE Users SET total_points = total_points + ? WHERE user_id = ?`, [points, user_id], function(err) {
                        if (err) {
                            console.error("Failed to update user points:", err.message);
                            return res.status(500).json({ error: "Failed to update user points" });
                        }

                        // 3. Update guild points
                        db.get(`SELECT guild_id FROM Users WHERE user_id = ?`, [user_id], (err, row) => {
                            if (err || !row) {
                                console.error("Failed to get user's guild:", err ? err.message : "No guild found");
                                return res.status(500).json({ error: "Failed to get user's guild" });
                            }

                            db.run(`UPDATE Guilds SET total_points = total_points + ? WHERE guild_id = ?`, [points, row.guild_id], function(err) {
                                if (err) {
                                    console.error("Failed to update guild points:", err.message);
                                    return res.status(500).json({ error: "Failed to update guild points" });
                                }

                                // 4. Log points earned in PointsLog
                                db.run(`INSERT INTO PointsLog (user_id, quest_id, points_earned, date_completed) VALUES (?, ?, ?, ?)`,
                                    [user_id, quest_id, points, date_completed], function(err) {
                                        if (err) {
                                            console.error("Failed to log points in PointsLog:", err.message);
                                            // Not returning error here to avoid blocking success response
                                        }
                                    });

                                res.json({ success: true, pointsEarned: points });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/quests', (req, res) => {
    db.all(`SELECT quest_id, title, points, description FROM Quests`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
});

// const bcrypt = require('bcrypt'); // Install with: npm install bcryptserver


app.post('/register', (req, res) => {
    const { email, first_name, last_name, password, is_admin, guild_id } = req.body;

    if (!email || !first_name || !last_name || !password || guild_id == null || is_admin == null) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Step 1: Check if email already exists
    db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ success: false, error: "Database error" });
        if (user) return res.status(400).json({ success: false, error: "Email already registered" });

        // Step 2: Hash password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false, error: "Error hashing password" });

            // Step 3: Insert user
            db.run(`
                INSERT INTO Users (email, first_name, last_name, password, is_admin, guild_id, total_points)
                VALUES (?, ?, ?, ?, ?, ?, 0)
            `,
            [email, first_name, last_name, hash, is_admin, guild_id],
            function (err) {
                if (err) return res.status(500).json({ success: false, error: "Failed to register user" });
                return res.json({ success: true, user_id: this.lastID });
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(400).json({ error: "Invalid email or password" });

        bcrypt.compare(password, row.password, (err, result) => {
            if (err) return res.status(500).json({ error: "Error comparing passwords" });
            if (!result) return res.status(400).json({ error: "Invalid email or password" });

            const user = {
                user_id: row.user_id,
                first_name: row.first_name,
                is_admin: row.is_admin,
                guild_id: row.guild_id
            };

            // Generate JWT token
            const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ success: true, user, token });
        });
    });
});

app.post('/login', (req, res) => {
    console.log("Login attempt:", req.body);
    // ...
});

// Fetch active poll and books
app.get('/api/active-poll', async (req, res) => {
  const poll = await db.get(`SELECT * FROM Polls WHERE is_active = 1`);
    if (!poll) return res.json({ poll: null, books: [] });

  const books = await db.all(`SELECT * FROM Books WHERE poll_id = ?`, [poll.poll_id]);
    res.json({ poll, books });
});

// Handle voting
app.post('/api/vote', async (req, res) => {
    const { user_id, book_id, poll_id } = req.body;
    try {
    const existingVote = await db.get(`SELECT * FROM Votes WHERE user_id = ? AND poll_id = ?`, [user_id, poll_id]);
    if (existingVote) {
        return res.status(400).json({ message: "You have already voted in this poll." });
    }

    await db.run(`INSERT INTO Votes (user_id, book_id, poll_id) VALUES (?, ?, ?)`, [user_id, book_id, poll_id]);
    res.json({ message: "Your vote has been recorded!" });
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to vote." });
    }
});


// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:8000`);
});

// ✅ Route 1: Get Active Poll with Books
app.get('/api/active-poll', (req, res) => {
    const query = `
    SELECT p.poll_id, p.title AS poll_title, p.description AS poll_description,
            b.book_id, b.title, b.author, b.description AS book_description, b.cover_url
    FROM Polls p
    JOIN Books b ON p.poll_id = b.poll_id
    WHERE p.active = 1
    `;
    db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) return res.status(404).json({ message: 'No active poll found.' });

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
    res.json(poll);
    });
});

// ✅ Route 2: Submit a Vote
app.post('/api/vote', (req, res) => {
    const { user_id, book_id, poll_id } = req.body;
    if (!user_id || !book_id || !poll_id) {
    return res.status(400).json({ error: 'Missing required vote data.' });
    }

  const checkQuery = `SELECT * FROM Votes WHERE user_id = ? AND poll_id = ?`;
    db.get(checkQuery, [user_id, poll_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'User has already voted in this poll.' });

    const insertQuery = `INSERT INTO Votes (user_id, book_id, poll_id) VALUES (?, ?, ?)`;
    db.run(insertQuery, [user_id, book_id, poll_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, vote_id: this.lastID });
    });
    });
});

app.get('/api/active-poll', async (req, res) => {
  db.get(`SELECT * FROM Polls WHERE active = 1 AND datetime('now') BETWEEN start_date AND end_date LIMIT 1`, (err, poll) => {
    if (err || !poll) return res.json({ poll: null, books: [] });

    db.all(`SELECT * FROM Books WHERE poll_id = ?`, [poll.poll_id], (err, books) => {
        if (err) return res.status(500).json({ error: 'Could not fetch books.' });
        res.json({ poll, books });
    });
    });
});

app.post('/api/vote', (req, res) => {
    const { user_id, book_id, poll_id } = req.body;

  db.get(`SELECT * FROM Votes WHERE user_id = ? AND poll_id = ?`, [user_id, poll_id], (err, row) => {
    if (row) {
        return res.json({ success: false, message: 'You have already voted.' });
    }

    db.run(`INSERT INTO Votes (user_id, book_id, poll_id) VALUES (?, ?, ?)`,
        [user_id, book_id, poll_id],
        (err) => {
        if (err) return res.json({ success: false, message: 'Database error.' });
        res.json({ success: true });
        });
    });
});
