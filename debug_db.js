import { db } from './config/database.js';

console.log('--- Schools ---');
console.log(db.prepare('SELECT * FROM schools').all());

console.log('\n--- Users ---');
console.log(db.prepare('SELECT id, name, email, role, school_id, school_assigned_id FROM users').all());

console.log('\n--- Student Profiles ---');
console.log(db.prepare('SELECT * FROM student_profiles').all());

console.log('\n--- Teacher Profiles ---');
console.log(db.prepare('SELECT * FROM teacher_profiles').all());
