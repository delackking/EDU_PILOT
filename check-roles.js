import { db } from './config/database.js';

console.log('User Roles:');
const users = db.prepare('SELECT email, role FROM users').all();
users.forEach(u => console.log(`${u.email}: ${u.role}`));
db.close();
