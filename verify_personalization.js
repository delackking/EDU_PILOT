import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001/api';
let studentToken = '';

function log(message) {
    console.log(message);
    fs.appendFileSync('verify_personalization_log.txt', message + '\n');
}

async function loginStudent() {
    log('\n🎓 Logging in Student (STD001)...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1,
            school_assigned_id: 'STD001',
            password: 'password123'
        })
    });
    const data = await res.json();
    if (data.token) {
        studentToken = data.token;
        log('✅ Student Login Successful');
    } else {
        log('❌ Student Login Failed: ' + JSON.stringify(data));
    }
}

async function generatePlan() {
    if (!studentToken) return;

    log('\n🤖 Generating Personalized Plan...');
    const res = await fetch(`${BASE_URL}/ai/personalized-plan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        }
    });

    const data = await res.json();
    if (data.success && data.plan) {
        log('✅ Plan Generated Successfully');
        log('   Priority Topic: ' + data.plan.priority_topic);
        log('   Reason: ' + data.plan.reason);
        log('   Action Plan: ' + JSON.stringify(data.plan.action_plan));
    } else {
        log('❌ Plan Generation Failed: ' + JSON.stringify(data));
    }
}

async function run() {
    try {
        fs.writeFileSync('verify_personalization_log.txt', '');
        await loginStudent();
        await generatePlan();
    } catch (e) {
        log('❌ Error: ' + e);
    }
}

run();
