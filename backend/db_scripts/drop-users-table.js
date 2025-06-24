// backend/db_scripts/drop-users-table.js
const { db } = require('../utils/database');

console.log('⚠️  WARNING: This will permanently delete the users table and ALL user accounts!');
console.log('🔄 Dropping users table...');

// First, check if the table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", [], (err, table) => {
    if (err) {
        console.error('❌ Error checking if table exists:', err);
        process.exit(1);
    }
    
    if (!table) {
        console.log('ℹ️  Users table does not exist');
        process.exit(0);
    }
    
    // Show user count before deletion
    db.get('SELECT COUNT(*) as count FROM users', [], (countErr, result) => {
        if (countErr) {
            console.error('❌ Error counting users:', countErr);
        } else {
            const userCount = result ? result.count : 0;
            console.log(`👥 Current users in database: ${userCount}`);
        }
        
        // Table exists, now drop it
        db.run('DROP TABLE IF EXISTS users', function(err) {
            if (err) {
                console.error('❌ Error dropping users table:', err);
            } else {
                console.log('✅ Users table dropped successfully');
                console.log('👥 All user accounts have been permanently deleted');
            }
            
            // Close database connection
            db.close();
            process.exit(0);
        });
    });
});