import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://127.0.0.1:5001/api';
const TEST_EMAIL = `teacher_${Date.now()}@test.com`;
const TEST_PASSWORD = 'password123';

async function runHealthCheck() {
    console.log('🏥 STARTING FULL SYSTEM HEALTH CHECK (Native Fetch)\n');
    console.log(`Target: ${API_URL}`);
    console.log(`Test User: ${TEST_EMAIL}`);

    try {
        // 1. Test Health Endpoint
        console.log('\n1️⃣ Testing Server Health...');
        const healthRes = await fetch(`${API_URL}/health`);
        if (!healthRes.ok) throw new Error(`Server Health Failed: ${healthRes.status}`);
        const healthData = await healthRes.json();
        console.log('✅ Server is UP:', healthData);

        // 2. Test Signup
        console.log('\n2️⃣ Testing Signup...');
        const signupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Teacher',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                role: 'TEACHER',
                school: 'Test School',
                experience_years: 5,
                specialization: 'Math'
            })
        });

        let token;
        if (signupRes.ok) {
            const data = await signupRes.json();
            console.log('✅ Signup Successful');
            token = data.token;
        } else {
            const err = await signupRes.json();
            if (err.error === 'Email already registered') {
                console.log('⚠️ User exists, proceeding to login...');
            } else {
                throw new Error(`Signup Failed: ${JSON.stringify(err)}`);
            }
        }

        // 3. Test Login
        if (!token) {
            console.log('\n3️⃣ Testing Login...');
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD
                })
            });

            if (!loginRes.ok) {
                const err = await loginRes.json();
                throw new Error(`Login Failed: ${JSON.stringify(err)}`);
            }
            const data = await loginRes.json();
            console.log('✅ Login Successful');
            token = data.token;
        }

        // 4. Test Auth Verification
        console.log('\n4️⃣ Testing Token Verification...');
        const verifyRes = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!verifyRes.ok) throw new Error(`Verification Failed: ${verifyRes.status}`);
        const verifyData = await verifyRes.json();
        console.log(`✅ Token Valid. Role: ${verifyData.user.role}`);
        if (verifyData.user.role !== 'TEACHER') throw new Error('Role Mismatch!');

        // 5. Test File Upload
        console.log('\n5️⃣ Testing PDF Upload...');
        const pdfPath = path.join(__dirname, 'health_check.pdf');
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%Test Content');

        // Create FormData with native File/Blob
        const fileContent = fs.readFileSync(pdfPath);
        const blob = new Blob([fileContent], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('pdf', blob, 'health_check.pdf');
        formData.append('subject', 'Math');
        formData.append('grade', '5');
        formData.append('chapterName', 'Health Check Chapter');

        const uploadRes = await fetch(`${API_URL}/teacher/upload-chapter`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Do NOT set Content-Type header for FormData, fetch sets it with boundary automatically
            },
            body: formData
        });

        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

        let chapterId;
        if (!uploadRes.ok) {
            const err = await uploadRes.text();
            throw new Error(`Upload Failed: ${uploadRes.status} - ${err}`);
        }
        const uploadData = await uploadRes.json();
        console.log('✅ Upload Successful');
        chapterId = uploadData.chapterId;

        // 6. Test Get Chapters
        console.log('\n6️⃣ Testing Get Chapters...');
        const chaptersRes = await fetch(`${API_URL}/teacher/chapters`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!chaptersRes.ok) throw new Error(`Get Chapters Failed: ${chaptersRes.status}`);
        const chaptersData = await chaptersRes.json();
        console.log(`✅ Retrieved ${chaptersData.chapters.length} chapters`);

        const found = chaptersData.chapters.find(c => c.id === chapterId);
        if (!found) throw new Error('Uploaded chapter not found in list');
        console.log('✅ Uploaded chapter verified in list');

        console.log('\n🎉 SYSTEM HEALTH CHECK PASSED! BACKEND IS PERFECT.');

    } catch (error) {
        console.error('\n❌ HEALTH CHECK FAILED');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

runHealthCheck();
