import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001/api';
let teacherToken = '';
let studentId = 0;

function log(message) {
    console.log(message);
    fs.appendFileSync('verify_attendance_log.txt', message + '\n');
}

async function loginTeacher() {
    log('\n🔑 Logging in as Teacher...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1,
            school_assigned_id: 'TCH001', // John Smith
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

async function verifyGetClassStudents() {
    log('\n🔍 Verifying Get Class Students...');
    const response = await fetch(`${BASE_URL}/teacher/class-students`, {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const data = await response.json();

    if (data.students && Array.isArray(data.students)) {
        log(`✅ Fetched ${data.students.length} students`);
        if (data.students.length > 0) {
            studentId = data.students[0].id; // Get first student profile ID
            log(`   First Student: ${data.students[0].name} (ID: ${studentId})`);
        }
    } else {
        log('❌ Failed to fetch students: ' + JSON.stringify(data));
    }
}

async function verifyMarkAttendance() {
    if (!studentId) {
        log('⚠️ Skipping Mark Attendance (No student ID found)');
        return;
    }

    log('\n📝 Verifying Mark Attendance...');
    const today = new Date().toISOString().split('T')[0];
    const records = [
        { studentId: studentId, status: 'PRESENT', remarks: 'On time' }
    ];

    const response = await fetch(`${BASE_URL}/teacher/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${teacherToken}`
        },
        body: JSON.stringify({ date: today, records })
    });
    const data = await response.json();

    if (data.success) {
        log('✅ Attendance Marked Successfully');
    } else {
        log('❌ Failed to mark attendance: ' + JSON.stringify(data));
    }
}

async function verifyGetAttendance() {
    log('\n🔍 Verifying Get Attendance...');
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/teacher/attendance/${today}`, {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const data = await response.json();

    if (data.attendance && Array.isArray(data.attendance)) {
        log(`✅ Fetched ${data.attendance.length} attendance records`);
        const record = data.attendance.find(r => r.student_id === studentId);
        if (record) {
            log(`   Verified Record for Student ${studentId}: ${record.status}`);
        } else {
            log('⚠️ Record for target student not found in response');
        }
    } else {
        log('❌ Failed to fetch attendance: ' + JSON.stringify(data));
    }
}

async function runVerification() {
    try {
        fs.writeFileSync('verify_attendance_log.txt', '');

        await loginTeacher();
        if (teacherToken) {
            await verifyGetClassStudents();
            await verifyMarkAttendance();
            await verifyGetAttendance();
        }

    } catch (error) {
        log('❌ Verification Error: ' + error);
    }
}

runVerification();
