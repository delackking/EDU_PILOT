import { db, initializeDatabase } from './config/database.js';

console.log('🗑️ Dropping custom_chapters table...');
db.exec('DROP TABLE IF EXISTS custom_chapters');
console.log('✅ Table dropped');

console.log('🔄 Re-initializing database...');
initializeDatabase();
console.log('✅ Database re-initialized');

db.close();
