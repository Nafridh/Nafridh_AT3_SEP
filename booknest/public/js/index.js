const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));  // Serve static files

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.first_name) {
    document.getElementById('navUserName').textContent = `Hello, ${user.first_name}`;
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

// Connect to database
const db = new sqlite3.Database("./datasource.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log("✅ Connected to SQLite database.");
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:8000/`);
});