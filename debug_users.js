import fs from 'fs';
import { db } from './config/database.js';

console.log('--- Registered Users ---');
const users = db.prepare('SELECT id, name, email, role, school_id, school_assigned_id FROM users').all();
const schools = db.prepare('SELECT * FROM schools').all();

fs.writeFileSync('debug_output.json', JSON.stringify({ users, schools }, null, 2));
console.log('Data written to debug_output.json');
