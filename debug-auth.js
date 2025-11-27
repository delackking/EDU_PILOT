import { db } from './config/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

console.log('🔍 Debugging Teacher Portal Auth...\n');

// Check teacher user
const teacher = db.prepare("SELECT * FROM users WHERE email = 'teacher@example.com'").get();
console.log('👨‍🏫 Teacher User:');
console.log(teacher);

if (teacher) {
    // Check teacher profile
    const profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(teacher.id);
    console.log('\n📋 Teacher Profile:');
    console.log(profile);

    // Generate a test token
    const testToken = jwt.sign(
        {
            id: teacher.id,
            email: teacher.email,
            role: teacher.role,
            profileId: profile?.id
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    console.log('\n🔑 Test Token Generated:');
    console.log(testToken);

    // Decode the token to verify
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('\n✅ Decoded Token:');
    console.log(decoded);
    console.log('\n📌 Role in token:', decoded.role);
    console.log('📌 Expected role: TEACHER');
    console.log('📌 Match:', decoded.role === 'TEACHER');
}

db.close();
