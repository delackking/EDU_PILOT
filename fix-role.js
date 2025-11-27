import { db } from './config/database.js';

const email = process.argv[2];
if (!email) {
    console.log('Please provide email');
    process.exit(1);
}

console.log(`Updating role for ${email} to TEACHER...`);
db.prepare("UPDATE users SET role = 'TEACHER' WHERE email = ?").run(email);

// Also ensure they have a teacher profile
const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
const profile = db.prepare("SELECT id FROM teacher_profiles WHERE user_id = ?").get(user.id);

if (!profile) {
    console.log('Creating teacher profile...');
    db.prepare("INSERT INTO teacher_profiles (user_id) VALUES (?)").run(user.id);
}

console.log('✅ Done!');
