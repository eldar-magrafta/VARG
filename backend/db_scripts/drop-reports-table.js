// backend/db_scripts/drop-reports-table.js
const { db } = require('../utils/database');

console.log('⚠️  WARNING: This will permanently delete the reports table and ALL report data!');
console.log('🔄 Dropping reports table...');

// First, check if the table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='reports'", [], (err, table) => {
    if (err) {
        console.error('❌ Error checking if table exists:', err);
        process.exit(1);
    }
    
    if (!table) {
        console.log('ℹ️  Reports table does not exist');
        process.exit(0);
    }
    
    // Table exists, now drop it
    db.run('DROP TABLE IF EXISTS reports', function(err) {
        if (err) {
            console.error('❌ Error dropping reports table:', err);
        } else {
            console.log('✅ Reports table dropped successfully');
            console.log('📊 All report data has been permanently deleted');
        }
        
        // Close database connection
        db.close();
        process.exit(0);
    });
});