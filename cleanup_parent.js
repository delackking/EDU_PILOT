import { db } from './config/database.js';

try {
    console.log('Deleting Test Parent...');
    const info = db.prepare("DELETE FROM users WHERE school_assigned_id = 'PRT001'").run();
    console.log('Delete info:', info);
} catch (error) {
    console.error('Error deleting parent:', error);
}
