import fetch from 'node-fetch';
import { db } from './config/database.js';

const API_URL = 'http://127.0.0.1:5001/api';
const STUDENT_EMAIL = `student_child_${Date.now()}@test.com`;
const PARENT_EMAIL = `parent_${Date.now()}@test.com`;
const PASSWORD = 'password123';

async function testParentFlow() {
    console.log('👨‍👩‍👧‍👦 TESTING PARENT PORTAL FLOW\n');

    try {
        // 1. Create Student
        console.log('1️⃣ Creating Student...');
        const studentRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Child', email: STUDENT_EMAIL, password: PASSWORD, role: 'STUDENT', class: 5 })
        });
        const studentData = await studentRes.json();
        const studentId = studentData.user.profileId;
        console.log('✅ Student created:', STUDENT_EMAIL);

        // Simulate some mastery data for the student
        db.prepare(`
            INSERT INTO mastery (student_id, topic_id, status, score, last_reviewed)
            VALUES (?, 1, 'WEAK', 40, datetime('now')), (?, 2, 'MASTERED', 90, datetime('now'))
        `).run(studentId, studentId);
        console.log('✅ Simulated mastery data');

        // 2. Create Parent
        console.log('\n2️⃣ Creating Parent...');
        const parentRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Parent', email: PARENT_EMAIL, password: PASSWORD, role: 'PARENT' })
        });
        const parentData = await parentRes.json();
        const parentToken = parentData.token;
        console.log('✅ Parent created');

        // 3. Link Child
        console.log('\n3️⃣ Linking Child...');
        const linkRes = await fetch(`${API_URL}/parent/link-child`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${parentToken}`
            },
            body: JSON.stringify({ studentEmail: STUDENT_EMAIL, relationship: 'Father' })
        });
        const linkData = await linkRes.json();
        console.log('Link Response:', linkData);
        if (!linkData.success) throw new Error('Linking failed');
        console.log('✅ Child linked successfully');

        // 4. Fetch Dashboard
        console.log('\n4️⃣ Fetching Dashboard...');
        const dashRes = await fetch(`${API_URL}/parent/dashboard`, {
            headers: { 'Authorization': `Bearer ${parentToken}` }
        });
        const dashData = await dashRes.json();
        console.log('Dashboard Children:', dashData.children.length);
        if (dashData.children.length !== 1) throw new Error('Dashboard should have 1 child');
        console.log('✅ Dashboard data correct');

        // 5. Fetch Analytics
        console.log('\n5️⃣ Fetching Analytics...');
        const analyticsRes = await fetch(`${API_URL}/parent/child/${studentId}/analytics`, {
            headers: { 'Authorization': `Bearer ${parentToken}` }
        });
        const analyticsData = await analyticsRes.json();
        console.log('Weak Areas:', analyticsData.weakAreas.length);
        console.log('Strong Areas:', analyticsData.strongAreas.length);
        if (analyticsData.weakAreas.length !== 1 || analyticsData.strongAreas.length !== 1) throw new Error('Analytics data mismatch');
        console.log('✅ Analytics data correct');

        // 6. Fetch Alerts
        console.log('\n6️⃣ Fetching Alerts...');
        const alertsRes = await fetch(`${API_URL}/parent/child/${studentId}/alerts`, {
            headers: { 'Authorization': `Bearer ${parentToken}` }
        });
        const alertsData = await alertsRes.json();
        console.log('Alerts:', alertsData.alerts.map(a => a.message));
        console.log('✅ Alerts fetched');

        console.log('\n🎉 PARENT PORTAL TEST PASSED!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
}

testParentFlow();
