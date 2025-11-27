import fetch from 'node-fetch';

const API_URL = 'http://127.0.0.1:5001/api';
const SCHOOL_PIN = '9999';
const SCHOOL_NAME = 'Test CRM School';
const TEACHER_EMAIL = `teacher_crm_${Date.now()}@test.com`;
const STUDENT_EMAIL = `student_crm_${Date.now()}@test.com`;
const PASSWORD = 'password123';

async function testCRM() {
    console.log('🏫 TESTING SCHOOL CRM FLOW\n');

    try {
        // 1. Create Teacher with PIN
        console.log('1️⃣ Creating Teacher with PIN...');
        const teacherRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'CRM Teacher',
                email: TEACHER_EMAIL,
                password: PASSWORD,
                role: 'TEACHER',
                school: SCHOOL_NAME,
                school_pin: SCHOOL_PIN,
                classes: [5, 6],
                subjects: ['Math', 'Science']
            })
        });
        const teacherData = await teacherRes.json();
        const teacherToken = teacherData.token;
        console.log('✅ Teacher created:', TEACHER_EMAIL);

        // 2. Create Student with Matching PIN
        console.log('\n2️⃣ Creating Student with Matching PIN...');
        const studentRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'CRM Student',
                email: STUDENT_EMAIL,
                password: PASSWORD,
                role: 'STUDENT',
                class: 5,
                school: SCHOOL_NAME,
                school_pin: SCHOOL_PIN
            })
        });
        const studentData = await studentRes.json();
        const studentId = studentData.user.profileId;
        console.log('✅ Student created:', STUDENT_EMAIL);

        // 3. Teacher Fetches "My Students"
        console.log('\n3️⃣ Teacher Fetching "My Students"...');
        const listRes = await fetch(`${API_URL}/teacher/my-students`, {
            headers: { 'Authorization': `Bearer ${teacherToken}` }
        });
        const listData = await listRes.json();
        console.log(`Found ${listData.students.length} students`);

        const foundStudent = listData.students.find(s => s.email === STUDENT_EMAIL);
        if (!foundStudent) throw new Error('Student not found in teacher list');
        console.log('✅ Student found in list');

        // 4. Teacher Adds Feedback
        console.log('\n4️⃣ Teacher Adding Feedback...');
        const feedbackRes = await fetch(`${API_URL}/teacher/student-feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                studentId: studentId,
                feedback: 'Great progress in Math!',
                performanceScore: 85
            })
        });
        const feedbackData = await feedbackRes.json();
        if (!feedbackData.success) throw new Error('Feedback failed');
        console.log('✅ Feedback added successfully');

        console.log('\n🎉 CRM TEST PASSED!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
}

testCRM();
