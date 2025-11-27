import { db } from './config/database.js';

console.log('👥 Users in Database:');
const users = db.prepare('SELECT id, email, name, role FROM users').all();
console.table(users);

console.log('\n👨‍🏫 Teacher Profiles:');
const teachers = db.prepare('SELECT * FROM teacher_profiles').all();
console.table(teachers);

db.close();
