import { db } from './config/database.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

async function migrateAndSeed() {
    console.log('🔄 Starting School System Migration...');

    try {
        // Disable foreign keys to allow dropping tables in any order
        db.pragma('foreign_keys = OFF');

        // 1. Drop existing tables to ensure clean slate for new schema
        console.log('🗑️  Dropping old tables...');
        db.exec('DROP TABLE IF EXISTS attendance');
        db.exec('DROP TABLE IF EXISTS student_feedback');
        db.exec('DROP TABLE IF EXISTS class_enrollments');
        db.exec('DROP TABLE IF EXISTS classes');
        db.exec('DROP TABLE IF EXISTS teacher_profiles');
        db.exec('DROP TABLE IF EXISTS student_profiles');
        db.exec('DROP TABLE IF EXISTS parent_profiles');
        db.exec('DROP TABLE IF EXISTS users');
        db.exec('DROP TABLE IF EXISTS schools');

        // Re-initialize database with new schema
        console.log('🏗️  Re-creating tables...');
        // We import initializeDatabase dynamically to get the updated version
        const { initializeDatabase } = await import('./config/database.js');
        initializeDatabase();

        // 2. Seed Demo School
        console.log('🌱 Seeding Demo School...');
        const schoolResult = db.prepare(`
            INSERT INTO schools (name, address, pin) 
            VALUES (?, ?, ?)
        `).run('Greenwood High', '123 Education Lane', '1234');

        const schoolId = schoolResult.lastInsertRowid;
        console.log(`✅ Created School: Greenwood High (ID: ${schoolId}, PIN: 1234)`);

        // 3. Seed Users
        const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

        // Seed Teacher
        const teacherResult = db.prepare(`
            INSERT INTO users (name, password, role, school_id, school_assigned_id, role_details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            'John Smith',
            hashedPassword,
            'TEACHER',
            schoolId,
            'TCH001',
            JSON.stringify({ subjects: ['Math', 'Science'], classes: [5, 6] })
        );
        const teacherId = teacherResult.lastInsertRowid;

        // Create Teacher Profile
        db.prepare(`
            INSERT INTO teacher_profiles (user_id, school, school_pin, subjects, classes)
            VALUES (?, ?, ?, ?, ?)
        `).run(teacherId, 'Greenwood High', '1234', 'Math,Science', '5,6');

        console.log(`✅ Created Teacher: John Smith (ID: TCH001)`);

        // Seed Student
        const studentResult = db.prepare(`
            INSERT INTO users (name, password, role, school_id, school_assigned_id, role_details)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            'Alice Doe',
            hashedPassword,
            'STUDENT',
            schoolId,
            'STD001',
            JSON.stringify({ class: 5, section: 'A' })
        );
        const studentId = studentResult.lastInsertRowid;

        // Create Student Profile
        db.prepare(`
            INSERT INTO student_profiles (user_id, class, school, school_pin, xp, level)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(studentId, 5, 'Greenwood High', '1234', 1500, 5);

        console.log(`✅ Created Student: Alice Doe (ID: STD001)`);

        // Seed Attendance
        const today = new Date().toISOString().split('T')[0];
        db.prepare(`
            INSERT INTO attendance (user_id, school_id, date, status)
            VALUES (?, ?, ?, ?)
        `).run(studentId, schoolId, today, 'PRESENT');

        console.log('✅ Seeded initial attendance');

        console.log('🎉 Migration and Seeding Complete!');

    } catch (error) {
        console.error('❌ Migration Failed:', error);
    }
}

migrateAndSeed();
