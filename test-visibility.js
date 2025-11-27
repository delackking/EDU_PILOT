import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = 'http://127.0.0.1:5001/api';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test Data
const TEACHER_EMAIL = `teacher_${Date.now()}@test.com`;
const STUDENT_EMAIL_G3 = `student_g3_${Date.now()}@test.com`; // Grade 3
const STUDENT_EMAIL_G5 = `student_g5_${Date.now()}@test.com`; // Grade 5
const PASSWORD = 'password123';

async function testVisibility() {
    console.log('🧪 TESTING STUDENT VISIBILITY & GRADE FILTERING\n');

    try {
        // 1. Create Teacher
        console.log('1️⃣ Creating Teacher...');
        const teacherRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Teacher', email: TEACHER_EMAIL, password: PASSWORD, role: 'TEACHER' })
        });
        const teacherData = await teacherRes.json();
        const teacherToken = teacherData.token;
        console.log('✅ Teacher created');

        // 2. Create Grade 3 Student
        console.log('\n2️⃣ Creating Grade 3 Student...');
        const s3Res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Student G3', email: STUDENT_EMAIL_G3, password: PASSWORD, role: 'STUDENT', class: 3 })
        });
        const s3Data = await s3Res.json();
        const s3Token = s3Data.token;
        console.log('✅ Grade 3 Student created');

        // 3. Create Grade 5 Student
        console.log('\n3️⃣ Creating Grade 5 Student...');
        const s5Res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Student G5', email: STUDENT_EMAIL_G5, password: PASSWORD, role: 'STUDENT', class: 5 })
        });
        const s5Data = await s5Res.json();
        const s5Token = s5Data.token;
        console.log('✅ Grade 5 Student created');

        // 4. Upload Chapter for Grade 3
        console.log('\n4️⃣ Teacher uploading Grade 3 Chapter...');
        const pdfPath = path.join(__dirname, 'test.pdf');
        fs.writeFileSync(pdfPath, 'dummy pdf content');

        const form = new FormData();
        form.append('pdf', fs.createReadStream(pdfPath));
        form.append('subject', 'Math');
        form.append('grade', '3');
        form.append('chapterName', 'Grade 3 Magic');

        const uploadRes = await fetch(`${API_URL}/teacher/upload-chapter`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${teacherToken}` },
            body: form
        });
        const uploadData = await uploadRes.json();
        console.log('Upload Response:', uploadData);

        if (!uploadData.success) throw new Error('Upload failed');
        console.log('✅ Chapter uploaded for Grade 3');

        // 5. Verify Grade 3 Student sees it
        console.log('\n5️⃣ Verifying Grade 3 Student sees the chapter...');
        const g3TopicsRes = await fetch(`${API_URL}/subjects/Math/topics`, {
            headers: { 'Authorization': `Bearer ${s3Token}` }
        });
        const g3Topics = await g3TopicsRes.json();
        const foundG3 = g3Topics.find(t => t.name === 'Grade 3 Magic');

        if (foundG3) console.log('✅ SUCCESS: Grade 3 student sees the chapter!');
        else {
            console.error('❌ FAILURE: Grade 3 student CANNOT see the chapter.');
            console.log('Topics found:', g3Topics.map(t => t.name));
        }

        // 6. Verify Grade 5 Student DOES NOT see it
        console.log('\n6️⃣ Verifying Grade 5 Student DOES NOT see the chapter...');
        const g5TopicsRes = await fetch(`${API_URL}/subjects/Math/topics`, {
            headers: { 'Authorization': `Bearer ${s5Token}` }
        });
        const g5Topics = await g5TopicsRes.json();
        const foundG5 = g5Topics.find(t => t.name === 'Grade 3 Magic');

        if (!foundG5) console.log('✅ SUCCESS: Grade 5 student does NOT see the chapter!');
        else console.error('❌ FAILURE: Grade 5 student SAW the chapter!');

        // Cleanup
        fs.unlinkSync(pdfPath);

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testVisibility();
