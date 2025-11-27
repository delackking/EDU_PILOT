import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = 'http://127.0.0.1:5001/api';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEACHER_EMAIL = `ai_tester_${Date.now()}@test.com`;
const PASSWORD = 'password123';

async function testAIFlow() {
    console.log('🤖 TESTING AI CHAPTER PROCESSING FLOW\n');

    try {
        // 1. Create Teacher
        console.log('1️⃣ Creating Teacher...');
        const teacherRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'AI Tester', email: TEACHER_EMAIL, password: PASSWORD, role: 'TEACHER' })
        });
        const teacherData = await teacherRes.json();
        const token = teacherData.token;
        console.log('✅ Teacher created');

        // 2. Create Mock PDF
        const pdfPath = path.join(__dirname, 'mock_chapter.pdf');
        const mockContent = `MOCK_PDF
        The Solar System
        
        The Solar System consists of the Sun and the objects that orbit it. 
        The Sun is a star at the center of the Solar System. It contains 99.86% of the system's mass.
        
        There are eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.
        Mercury is the closest planet to the Sun. Venus is the hottest planet.
        Earth is the only planet known to support life. Mars is known as the Red Planet.
        
        Jupiter is the largest planet. Saturn is famous for its rings.
        Uranus and Neptune are ice giants.
        `;
        fs.writeFileSync(pdfPath, mockContent);

        // 3. Upload Chapter
        console.log('\n2️⃣ Uploading Chapter...');
        const form = new FormData();
        form.append('pdf', fs.createReadStream(pdfPath));
        form.append('subject', 'Science');
        form.append('grade', '5');
        form.append('chapterName', 'Solar System AI Test');

        const uploadRes = await fetch(`${API_URL}/teacher/upload-chapter`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form
        });
        const uploadData = await uploadRes.json();
        console.log('Upload Response:', uploadData);

        if (!uploadData.success) throw new Error('Upload failed');
        const chapterId = uploadData.chapterId;

        // 4. Poll for Completion
        console.log('\n3️⃣ Polling for AI Completion...');
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds

        while (attempts < maxAttempts) {
            const checkRes = await fetch(`${API_URL}/teacher/chapter/${chapterId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const checkData = await checkRes.json();
            const status = checkData.chapter.status;

            process.stdout.write(`\rStatus: ${status} (${attempts}/${maxAttempts})`);

            if (status === 'completed') {
                console.log('\n\n✅ AI Processing Completed!');
                console.log(`Topics Created: ${checkData.chapter.topics_count}`);
                console.log(`Questions Created: ${checkData.chapter.questions_count}`);

                // Verify Topics
                console.log('\n4️⃣ Verifying Content...');
                console.log('Topics:', checkData.topics.map(t => t.name));

                if (checkData.topics.length > 0 && checkData.topics[0].questions.length > 0) {
                    console.log('✅ SUCCESS: Topics and Questions generated!');
                } else {
                    console.error('❌ FAILURE: No topics or questions found.');
                }
                break;
            } else if (status === 'failed') {
                console.error('\n\n❌ AI Processing FAILED:', checkData.chapter.error_message);
                break;
            }

            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }

        if (attempts >= maxAttempts) {
            console.error('\n\n❌ Timeout waiting for AI processing');
        }

        // Cleanup
        fs.unlinkSync(pdfPath);

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
}

testAIFlow();
