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

// Create tables if they don't exist
function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME NOT NULL
        )
    `;

    const createReportsTable = `
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            report_content TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('❌ Error creating users table:', err.message);
        } else {
            console.log('✅ Users table ready');
        }
    });

    db.run(createReportsTable, (err) => {
        if (err) {
            console.error('❌ Error creating reports table:', err.message);
        } else {
            console.log('✅ Reports table ready');
        }
    });
}

// User queries
const userQueries = {
    findByUsername: (username, callback) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], callback);
    },

    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], callback);
    },

    create: (username, email, hashedPassword, callback) => {
        const createdAt = new Date().toISOString();
        const sql = 'INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)';
        db.run(sql, [username, email, hashedPassword, createdAt], callback);
    },

    findById: (id, callback) => {
        const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
        db.get(sql, [id], callback);
    }
};

// Report queries
const reportQueries = {
    create: (userId, reportContent, callback) => {
        const createdAt = new Date().toISOString();
        const sql = 'INSERT INTO reports (user_id, report_content, created_at) VALUES (?, ?, ?)';
        db.run(sql, [userId, reportContent, createdAt], callback);
    },

    findByUserId: (userId, callback) => {
        const sql = 'SELECT id, report_content, created_at, updated_at FROM reports WHERE user_id = ? ORDER BY created_at DESC';
        db.all(sql, [userId], callback);
    },

    findById: (reportId, callback) => {
        const sql = 'SELECT * FROM reports WHERE id = ?';
        db.get(sql, [reportId], callback);
    },

    update: (reportId, reportContent, callback) => {
        const updatedAt = new Date().toISOString();
        const sql = 'UPDATE reports SET report_content = ?, updated_at = ? WHERE id = ?';
        db.run(sql, [reportContent, updatedAt, reportId], callback);
    },

    delete: (reportId, callback) => {
        const sql = 'DELETE FROM reports WHERE id = ?';
        db.run(sql, [reportId], callback);
    }

};

module.exports = { db, userQueries, reportQueries };