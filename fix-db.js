import { db } from './config/database.js';

console.log('🔧 Fixing Database Schema...');

try {
    // Check if column exists
    const tableInfo = db.prepare("PRAGMA table_info(custom_chapters)").all();
    const hasTeacherId = tableInfo.some(col => col.name === 'teacher_id');

    if (!hasTeacherId) {
        console.log('Adding teacher_id column to custom_chapters...');
        db.prepare("ALTER TABLE custom_chapters ADD COLUMN teacher_id INTEGER REFERENCES users(id)").run();
        console.log('✅ Column added successfully');
    } else {
        console.log('ℹ️ Column teacher_id already exists');
    }

    // Verify
    const updatedInfo = db.prepare("PRAGMA table_info(custom_chapters)").all();
    console.log('Current Columns:', updatedInfo.map(c => c.name).join(', '));

} catch (error) {
    console.error('❌ Migration failed:', error.message);
}
