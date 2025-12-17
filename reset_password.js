import { db } from './config/database.js';
import bcrypt from 'bcryptjs';

const email = 'delackking@gmail.com';
const newPassword = 'password123';
const hashedPassword = bcrypt.hashSync(newPassword, 10);

const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);

if (result.changes > 0) {
    console.log(`Password for ${email} reset successfully to '${newPassword}'`);
} else {
    console.log(`User ${email} not found`);
}
