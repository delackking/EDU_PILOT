import { db } from './config/database.js';

console.log('🔍 Checking database state...\n');

// Check tables
console.log('📋 Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n👥 Users:');
const users = db.prepare('SELECT id, email, role FROM users').all();
users.forEach(u => console.log(`  - ${u.id}: ${u.email} (${u.role})`));

console.log('\n👨‍🏫 Teacher Profiles:');
const teachers = db.prepare('SELECT * FROM teacher_profiles').all();
console.log(`  Count: ${teachers.length}`);
teachers.forEach(t => console.log(`  - ID: ${t.id}, User ID: ${t.user_id}`));

console.log('\n📚 Custom Chapters:');
const chapters = db.prepare('SELECT * FROM custom_chapters').all();
console.log(`  Count: ${chapters.length}`);

console.log('\n✅ Database check complete!');
db.close();
