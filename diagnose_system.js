import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './config/database.js';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://127.0.0.1:5001/api';

async function diagnoseSystem() {
    console.log('🏥 STARTING SYSTEM DIAGNOSIS...\n');
    let errors = 0;

    // 1. Check File System
    console.log('1️⃣ Checking File System...');
    const uploadsDir = path.join(__dirname, 'uploads', 'chapters');
    if (!fs.existsSync(uploadsDir)) {
        console.log('❌ Uploads directory missing. Creating it...');
        try {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('✅ Created uploads directory');
        } catch (e) {
            console.error('❌ Failed to create uploads directory:', e.message);
            errors++;
        }
    } else {
        console.log('✅ Uploads directory exists');
    }

    // 2. Check Database Integrity
    console.log('\n2️⃣ Checking Database Integrity...');
    const tables = [
        'users', 'student_profiles', 'teacher_profiles', 'parent_profiles',
        'topics', 'questions', 'mastery', 'mistake_logs',
        'classes', 'class_enrollments', 'parent_children',
        'custom_chapters', 'custom_questions', 'rewards', 'emotion_logs',
        'student_feedback'
    ];

    for (const table of tables) {
        try {
            const count = db.prepare(`SELECT count(*) as count FROM ${table}`).get();
            console.log(`✅ Table '${table}' exists (${count.count} records)`);
        } catch (e) {
            console.error(`❌ Table '${table}' MISSING or CORRUPT:`, e.message);
            errors++;
        }
    }

    // 3. Check Server Connectivity
    console.log('\n3️⃣ Checking Server Connectivity...');
    try {
        const res = await fetch(`${API_URL}/auth/verify`); // This might fail if no token, but 401 means server is up
        if (res.status === 401 || res.status === 200) {
            console.log('✅ Server is reachable (Port 5001)');
        } else {
            console.error(`❌ Server returned unexpected status: ${res.status}`);
            errors++;
        }
    } catch (e) {
        console.error('❌ Server UNREACHABLE. Is it running?', e.message);
        errors++;
    }

    console.log('\n-----------------------------------');
    if (errors === 0) {
        console.log('🎉 SYSTEM DIAGNOSIS PASSED! No issues found.');
    } else {
        console.log(`⚠️ SYSTEM DIAGNOSIS COMPLETED WITH ${errors} ERRORS.`);
    }
}

diagnoseSystem();
