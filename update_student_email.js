import { db } from './config/database.js';

try {
    console.log('Updating Alice Doe email...');
    const info = db.prepare("UPDATE users SET email = 'student@example.com' WHERE school_assigned_id = 'STD001'").run();
    console.log('Update info:', info);
} catch (error) {
    console.error('Error updating email:', error);
}
