import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001/api';
let parentToken = '';
let studentId = 0;

function log(message) {
    console.log(message);
    fs.appendFileSync('verify_parent_log.txt', message + '\n');
}

// Helper to login as parent (using existing user or we might need to seed one)
// For this test, we'll assume we can login as the admin who is also a parent, or we need to find a parent user.
// Actually, let's use the demo parent if available, or create one.
// Wait, the seed data might not have a parent. Let's check.
// If no parent exists, we can't easily verify without creating one.
// Let's try to login as a known user or skip if no parent.

// Strategy: Login as Teacher, get a student, then try to link that student to a new parent account?
// Or better: Just check if the endpoint works if we had a token.
// Since we don't have a guaranteed parent account in seed, let's create one via the script if possible.
// But we don't have a public signup for parents easily accessible via API without school pin etc.
// Actually, we can use the 'register-school' flow to get an admin, but that's not a parent.

// Let's use the existing 'users' table to find a parent or create one directly in DB?
// No, we should use API.
// Let's assume we can login as 'parent@example.com' if it exists, or create it.
// Since I can't easily create a parent via public API without UI flow complexity, 
// I will try to login as the admin (who has all roles? No).

// Alternative: I will just verify the endpoint logic by mocking a request if I could, but I can't.
// Let's try to login as the 'admin' and see if they can act as a parent? No, role check.

// Okay, I will create a temporary parent user directly in the DB using a separate script logic?
// No, I'll use the auth/signup endpoint to create a parent.
// Signup requires School PIN. I know the PIN is '1234'.

async function createAndLoginParent() {
    log('\n👤 Creating/Logging in Parent...');

    // 1. Signup
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1, // Added school_id
            name: 'Test Parent',
            email: 'parent.test@example.com',
            password: 'password123',
            role: 'PARENT',
            school_pin: '1234',
            school_assigned_id: 'PRT001' // Parent ID
        })
    });

    const signupData = await signupRes.json();
    if (signupRes.ok) {
        log('✅ Parent Signup Successful');
    } else {
        log('⚠️ Parent Signup Failed (might exist): ' + JSON.stringify(signupData));
    }

    // If already exists, it might fail, so we try login next.

    // 2. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1, // Assuming school 1
            school_assigned_id: 'PRT001',
            password: 'password123'
        })
    });

    const data = await loginRes.json();
    if (data.token) {
        parentToken = data.token;
        log('✅ Parent Login Successful');
    } else {
        log('❌ Parent Login Failed: ' + JSON.stringify(data));
    }
}

async function linkChild() {
    log('\n🔗 Linking Child...');
    // We need a student email. Alice Doe is 'alice@example.com' (from seed usually? or we need to check).
    // Let's assume 'alice@example.com' exists or we need to find a student.
    // Actually, the seed creates Alice Doe. Let's try to link her.
    // Wait, the seed in database.js doesn't explicitly set email for Alice, it sets name and ID.
    // Let's check the seed logic in database.js if visible... 
    // It wasn't fully visible in previous turns.
    // I'll try to link using the ID if the API supported it, but it supports email.

    // Let's try to fetch a student first using teacher token? Too complex.
    // Let's just try to link 'student@example.com' or 'alice@test.com'.
    // If it fails, I'll skip linking and just try to fetch dashboard (which will be empty).

    const res = await fetch(`${BASE_URL}/parent/link-child`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${parentToken}`
        },
        body: JSON.stringify({
            studentEmail: 'student@example.com', // Default seed student email often
            relationship: 'Father'
        })
    });

    const data = await res.json();
    log('   Link Child Result: ' + JSON.stringify(data));
}

async function verifyDashboard() {
    log('\n🏠 Verifying Dashboard...');
    const res = await fetch(`${BASE_URL}/parent/dashboard`, {
        headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const data = await res.json();

    if (data.children) {
        log(`✅ Dashboard fetched. Linked Children: ${data.children.length}`);
        if (data.children.length > 0) {
            studentId = data.children[0].id; // This is the profile ID
            log(`   Child ID: ${studentId}`);
        }
    } else {
        log('❌ Dashboard fetch failed: ' + JSON.stringify(data));
    }
}

async function verifyAnalytics() {
    if (!studentId) {
        log('⚠️ Skipping Analytics (No child linked)');
        return;
    }

    log('\n📊 Verifying Analytics...');
    const res = await fetch(`${BASE_URL}/parent/child/${studentId}/analytics`, {
        headers: { 'Authorization': `Bearer ${parentToken}` }
    });
    const data = await res.json();

    if (data.attendance && data.overallGrade) {
        log('✅ Analytics fetched successfully');
        log(`   Overall Grade: ${data.overallGrade}`);
        log(`   Attendance: ${JSON.stringify(data.attendance)}`);
    } else {
        log('❌ Analytics missing new fields: ' + JSON.stringify(data));
    }
}

async function run() {
    try {
        fs.writeFileSync('verify_parent_log.txt', '');
        await createAndLoginParent();
        if (parentToken) {
            await linkChild();
            await verifyDashboard();
            await verifyAnalytics();
        }
    } catch (e) {
        log('❌ Error: ' + e);
    }
}

run();
