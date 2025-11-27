const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function testDirectUpload() {
    console.log('🧪 Testing Direct Backend Upload...\n');

    try {
        // 1. Login
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'teacher@example.com',
            password: 'password123'
        });
        const token = loginResponse.data.token;
        console.log('✅ Login successful!');

        // 2. Create dummy PDF
        const pdfPath = path.join(__dirname, 'test.pdf');
        fs.writeFileSync(pdfPath, '%PDF-1.4\n%Test PDF content');
        console.log('✅ Created dummy PDF');

        // 3. Upload
        console.log('\n2️⃣ Uploading chapter...');
        const form = new FormData();
        form.append('pdf', fs.createReadStream(pdfPath));
        form.append('subject', 'Math');
        form.append('grade', '5');
        form.append('chapterName', 'Direct API Test');

        const uploadResponse = await axios.post(`${API_URL}/teacher/upload-chapter`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        console.log('✅ Upload successful!');
        console.log('Response:', uploadResponse.data);

        // Cleanup
        fs.unlinkSync(pdfPath);

    } catch (error) {
        console.error('❌ Upload failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testDirectUpload();
