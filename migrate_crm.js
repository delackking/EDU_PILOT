import { db } from './config/database.js';

console.log('🔄 Starting CRM Migration...');

try {
    // 1. Add columns to teacher_profiles
    try {
        db.prepare('ALTER TABLE teacher_profiles ADD COLUMN classes TEXT').run();
        console.log('✅ Added classes to teacher_profiles');
    } catch (e) { console.log('ℹ️ classes column likely exists'); }

    try {
        db.prepare('ALTER TABLE teacher_profiles ADD COLUMN subjects TEXT').run();
        console.log('✅ Added subjects to teacher_profiles');
    } catch (e) { console.log('ℹ️ subjects column likely exists'); }

    try {
        db.prepare('ALTER TABLE teacher_profiles ADD COLUMN school_pin TEXT').run();
        console.log('✅ Added school_pin to teacher_profiles');
    } catch (e) { console.log('ℹ️ school_pin column likely exists'); }

    // 2. Add columns to student_profiles
    try {
        db.prepare('ALTER TABLE student_profiles ADD COLUMN school_pin TEXT').run();
        console.log('✅ Added school_pin to student_profiles');
    } catch (e) { console.log('ℹ️ school_pin column likely exists'); }

    // 3. Create student_feedback table
    db.exec(`
        CREATE TABLE IF NOT EXISTS student_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            teacher_id INTEGER NOT NULL,
            feedback TEXT,
            performance_score INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE
        )
    `);
    console.log('✅ Created student_feedback table');

    console.log('🎉 Migration Complete!');
} catch (error) {
    console.error('❌ Migration Failed:', error);
}
