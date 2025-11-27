// Test script to verify teacher API endpoints
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testTeacherAPI() {
    console.log('🧪 Testing Teacher API Endpoints...\n');

    try {
        // Step 1: Login as teacher
        console.log('1️⃣ Logging in as teacher...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'teacher@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;

        console.log('✅ Login successful!');
        console.log('   User:', user);
        console.log('   Token:', token.substring(0, 50) + '...');
        console.log('   Role:', user.role);

        // Step 2: Test GET /api/teacher/chapters
        console.log('\n2️⃣ Testing GET /api/teacher/chapters...');
        try {
            const chaptersResponse = await axios.get(`${API_URL}/teacher/chapters`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Chapters endpoint works!');
            console.log('   Chapters:', chaptersResponse.data.chapters);
        } catch (error) {
            console.error('❌ Chapters endpoint failed!');
            console.error('   Status:', error.response?.status);
            console.error('   Error:', error.response?.data);
        }

        // Step 3: Test health endpoint
        console.log('\n3️⃣ Testing GET /api/health...');
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('✅ Health endpoint works!');
        console.log('   Response:', healthResponse.data);

    } catch (error) {
        console.error('❌ Test failed!');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testTeacherAPI();
