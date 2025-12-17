import { db } from './config/database.js';

console.log('\n--- Users with Role Details ---');
console.log(db.prepare('SELECT id, name, role, role_details FROM users').all());
