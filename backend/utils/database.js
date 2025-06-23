// backend/utils/database.js - Simple SQLite Database Setup
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in backend directory
const dbPath = path.join(__dirname, '../database.sqlite');

// Initialize database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create users table if it doesn't exist
function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('❌ Error creating users table:', err.message);
        } else {
            console.log('✅ Users table ready');
        }
    });
}

// Simple functions to interact with users table
const userQueries = {
    // Find user by username
    findByUsername: (username, callback) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], callback);
    },

    // Find user by email
    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], callback);
    },

    // Create new user
    create: (username, email, hashedPassword, callback) => {
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.run(sql, [username, email, hashedPassword], callback);
    },

    // Find user by ID
    findById: (id, callback) => {
        const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
        db.get(sql, [id], callback);
    }
};

module.exports = { db, userQueries };