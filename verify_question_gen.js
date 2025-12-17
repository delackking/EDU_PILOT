import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001/api';
let teacherToken = '';
let topicId = null;

function log(message) {
    console.log(message);
    fs.appendFileSync('verify_question_gen_log.txt', message + '\n');
}

async function loginTeacher() {
    log('\n👨‍🏫 Logging in Teacher (TCH001)...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            school_id: 1,
            school_assigned_id: 'TCH001',
            password: 'password123'
        })
    });
    const data = await res.json();
    if (data.token) {
        teacherToken = data.token;
        log('✅ Teacher Login Successful');
    } else {
        log('❌ Teacher Login Failed: ' + JSON.stringify(data));
    }
}

async function fetchTopics() {
    if (!teacherToken) return;
    log('\n📚 Fetching Topics...');
    const res = await fetch(`${BASE_URL}/teacher/topics`, {
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const data = await res.json();
    if (data.topics && data.topics.length > 0) {
        topicId = data.topics[0].id;
        log(`✅ Found ${data.topics.length} topics. Using Topic ID: ${topicId} (${data.topics[0].name})`);
    } else {
        log('⚠️ No topics found. Cannot proceed with saving to a topic.');
        // If no topics, we can still test generation with a custom topic name
    }
}

async function generateQuestions() {
    if (!teacherToken) return;
    log('\n✨ Generating Questions...');

    const res = await fetch(`${BASE_URL}/teacher/generate-questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
            topic: 'Photosynthesis',
            count: 2,
            difficulty: 3
        })
    });

    const data = await res.json();
    if (data.success && data.questions) {
        log(`✅ Generated ${data.questions.length} questions`);
        return data.questions;
    } else {
        log('❌ Generation Failed: ' + JSON.stringify(data));
        return [];
    }
}

async function saveQuestions(questions) {
    if (!teacherToken || !topicId || questions.length === 0) return;
    log('\n💾 Saving Questions...');

    const res = await fetch(`${BASE_URL}/teacher/save-questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
            topicId: topicId,
            questions: questions
        })
    });

    const data = await res.json();
    if (data.success) {
        log('✅ Questions Saved Successfully');
    } else {
        log('❌ Save Failed: ' + JSON.stringify(data));
    }
}

async function run() {
    try {
        fs.writeFileSync('verify_question_gen_log.txt', '');
        await loginTeacher();
        await fetchTopics();
        const questions = await generateQuestions();
        if (questions.length > 0 && topicId) {
            await saveQuestions(questions);
        }
    } catch (e) {
        log('❌ Error: ' + e);
    }
}

run();
