// clear-reports.js
const { db } = require('./utils/database');

console.log('🗑️ Clearing all reports from database...');

db.run('DELETE FROM reports', function(err) {
    if (err) {
        console.error('❌ Error clearing reports:', err);
    } else {
        console.log(`✅ Successfully deleted ${this.changes} reports`);
        console.log('📊 Reports database is now empty');
    }
    
    // Close database connection
    db.close();
});