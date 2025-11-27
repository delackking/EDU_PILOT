import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = `teacher_${Date.now()}@test.com`;
const TEST_PASSWORD = 'password123';

async function runHealthCheck() {
    console.log('🏥 STARTING FULL SYSTEM HEALTH CHECK\n');
    console.log(`Target: ${API_URL}`);
    console.log(`Test User: ${TEST_EMAIL}`);

    try {
        // 1. Test Health Endpoint
        console.log('\n1️⃣ Testing Server Health...');
        try {
            const health = await axios.get(`${API_URL}/health`);
            console.log('✅ Server is UP:', health.data);
        } catch (e) {
            throw new Error(`Server is DOWN: ${e.message}`);
        }

        // 2. Test Signup
        console.log('\n2️⃣ Testing Signup...');
        let token;
        try {
            const signup = await axios.post(`${API_URL}/auth/signup`, {
                name: 'Test Teacher',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                role: 'TEACHER',
                school: 'Test School',
                experience_years: 5,
                specialization: 'Math'
            });
            console.log('✅ Signup Successful');
            token = signup.data.token;
        } catch (e) {
            if (e.response?.data?.error === 'Email already registered') {
                console.log('⚠️ User exists, proceeding to login...');
            } else {
                throw new Error(`Signup Failed: ${e.response?.data?.error || e.message}`);
            }
        }

        // 3. Test Login (if signup didn't give token or just to verify)
        if (!token) {
            console.log('\n3️⃣ Testing Login...');
            try {
                const login = await axios.post(`${API_URL}/auth/login`, {
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD
                });
                console.log('✅ Login Successful');
                token = login.data.token;
            } catch (e) {
                throw new Error(`Login Failed: ${e.response?.data?.error || e.message}`);
            }
        }

        // 4. Test Auth Verification
        console.log('\n4️⃣ Testing Token Verification...');
        try {
            const verify = await axios.get(`${API_URL}/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Token Valid. Role: ${verify.data.user.role}`);
            if (verify.data.user.role !== 'TEACHER') throw new Error('Role Mismatch!');
        } catch (e) {
            throw new Error(`Verification Failed: ${e.message}`);
        }

        // 5. Test File Upload
        console.log('\n5️⃣ Testing PDF Upload...');
        const pdfPath = path.join(__dirname, 'health_check.pdf');
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%Test Content');

        let chapterId;
        try {
            const form = new FormData();
            form.append('pdf', fs.createReadStream(pdfPath));
            form.append('subject', 'Math');
            form.append('grade', '5');
            form.append('chapterName', 'Health Check Chapter');

            const upload = await axios.post(`${API_URL}/teacher/upload-chapter`, form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('✅ Upload Successful');
            chapterId = upload.data.chapterId;
        } catch (e) {
            throw new Error(`Upload Failed: ${e.response?.data?.error || e.message}`);
        } finally {
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        }

        // 6. Test Get Chapters
        console.log('\n6️⃣ Testing Get Chapters...');
        try {
            const chapters = await axios.get(`${API_URL}/teacher/chapters`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Retrieved ${chapters.data.chapters.length} chapters`);
            const found = chapters.data.chapters.find(c => c.id === chapterId);
            if (!found) throw new Error('Uploaded chapter not found in list');
            console.log('✅ Uploaded chapter verified in list');
        } catch (e) {
            throw new Error(`Get Chapters Failed: ${e.message}`);
        }

        console.log('\n🎉 SYSTEM HEALTH CHECK PASSED! BACKEND IS PERFECT.');

    } catch (error) {
        console.error('\n❌ HEALTH CHECK FAILED');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

runHealthCheck();
