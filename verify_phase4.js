import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001/api';
let teacherToken = '';
let studentToken = '';

function log(message) {
    console.log(message);
    fs.appendFileSync('verify_log.txt', message + '\n');
}

async function loginTeacher() {
    log('\n🔑 Logging in as Teacher...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1,
            school_assigned_id: 'TCH001',
            password: 'password123'
        })
    });
    const data = await response.json();
    if (data.token) {
        teacherToken = data.token;
        log('✅ Teacher Login Successful');
    } else {
        log('❌ Teacher Login Failed: ' + JSON.stringify(data));
    }
}

async function loginStudent() {
    log('\n🔑 Logging in as Student...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1,
            school_assigned_id: 'STD001', // Alice Doe
            password: 'password123'
        })
    });
    const data = await response.json();
    if (data.token) {
        studentToken = data.token;
        log('✅ Student Login Successful');
    } else {
        log('❌ Student Login Failed: ' + JSON.stringify(data));
    }
}

async function verifyTeacherGetStudentProfile() {
    log('\n🔍 Verifying Teacher -> Get Student Profile...');
    // First get my students to find a valid student ID
    const studentsRes = await fetch(`${BASE_URL}/teacher/my-students`, {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const studentsData = await studentsRes.json();

    if (studentsData.students && studentsData.students.length > 0) {
        const targetStudent = studentsData.students[0];
        log(`   Target Student: ${targetStudent.name} (ID: ${targetStudent.id})`);

        const profileRes = await fetch(`${BASE_URL}/teacher/student/${targetStudent.id}/full-profile`, {
            headers: { 'Authorization': `Bearer ${teacherToken}` }
        });
        const profileData = await profileRes.json();

        if (profileData.profile && profileData.academic) {
            log('✅ Fetched Detailed Profile Successfully');
            log('   Academic Grade: ' + profileData.academic.overall_grade);
        } else {
            log('❌ Failed to fetch profile: ' + JSON.stringify(profileData));
        }
    } else {
        log('⚠️ No students found for this teacher to test with.');
    }
}

async function verifyStudentGetTeachers() {
    log('\n🔍 Verifying Student -> Get My Teachers...');
    const response = await fetch(`${BASE_URL}/student/my-teachers`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const data = await response.json();

    if (Array.isArray(data)) {
        log(`✅ Fetched ${data.length} Teachers`);
        if (data.length > 0) {
            log('   First Teacher: ' + data[0].name);
        }
    } else {
        log('❌ Failed to fetch teachers: ' + JSON.stringify(data));
    }
}

async function runVerification() {
    try {
        // Clear log file
        fs.writeFileSync('verify_log.txt', '');

        await loginTeacher();
        if (teacherToken) await verifyTeacherGetStudentProfile();

        await loginStudent();
        if (studentToken) await verifyStudentGetTeachers();

    } catch (error) {
        log('❌ Verification Error: ' + error);
    }
}

runVerification();
