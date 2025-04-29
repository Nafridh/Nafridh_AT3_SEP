const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Connect to database
const db = new sqlite3.Database("./.database/datasource.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log("Connected to SQLite database.");
});

// API Endpoints

// Get all books
app.get("/api/books", (req, res) => {
    db.all("SELECT * FROM books", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Books fetched successfully:", rows); // Log the books here
        res.json(rows);
    });
});

// Get book by ID
app.get("/api/books/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM books WHERE isbn = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Search books by genre
app.get("/api/books/search", (req, res) => {
    const genre = req.query.genre;
    db.all("SELECT * FROM books WHERE genre_ship LIKE ?", [`%${genre}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get limited book previews
app.get("/api/books/previews", (req, res) => {
    db.all("SELECT title, cover_image FROM books LIMIT 5", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Book previews fetched:", rows); // Log the previews here
        const books = rows.map(book => ({
            title: book.title,
            cover_image: `/images/${book.cover_image}` // Assuming images are in public/images/
        }));
        res.json(books);
    });
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}/`);
    console.log(`📚 API available at http://localhost:${PORT}/api/books`);
});
