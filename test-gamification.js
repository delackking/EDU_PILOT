import fetch from 'node-fetch';
import { db } from './config/database.js';

const API_URL = 'http://127.0.0.1:5001/api';
const PASSWORD = 'password123';

async function testGamification() {
    console.log('🏆 TESTING LEADERBOARD & GAMIFICATION\n');

    try {
        // 1. Create 3 Students with different XP
        const students = [
            { name: 'Top Student', xp: 5000, email: `top_${Date.now()}@test.com` },
            { name: 'Mid Student', xp: 2500, email: `mid_${Date.now()}@test.com` },
            { name: 'Low Student', xp: 1000, email: `low_${Date.now()}@test.com` }
        ];

        let topToken = '';

        for (const s of students) {
            console.log(`Creating ${s.name}...`);
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: s.name, email: s.email, password: PASSWORD, role: 'STUDENT', class: 5 })
            });
            const data = await res.json();
            const studentId = data.user.profileId;

            if (s.name === 'Top Student') topToken = data.token;

            // Update XP directly in DB
            db.prepare('UPDATE student_profiles SET xp = ? WHERE id = ?').run(s.xp, studentId);
        }
        console.log('✅ Students created and XP assigned');

        // 2. Fetch Global Leaderboard
        console.log('\n2️⃣ Fetching Global Leaderboard...');
        const globalRes = await fetch(`${API_URL}/gamification/leaderboard?type=global`, {
            headers: { 'Authorization': `Bearer ${topToken}` }
        });
        const globalData = await globalRes.json();

        console.log('Top 3 Global:');
        globalData.leaderboard.slice(0, 3).forEach((s, i) => {
            console.log(`${i + 1}. ${s.name} - ${s.xp} XP`);
        });

        // Verify Order
        if (globalData.leaderboard[0].xp < globalData.leaderboard[1].xp) {
            throw new Error('Leaderboard not sorted correctly');
        }
        console.log('✅ Global Leaderboard sorted correctly');

        // 3. Verify User Rank
        console.log('\n3️⃣ Verifying User Rank...');
        console.log(`Top Student Rank: #${globalData.userRank}`);
        if (globalData.userRank !== 1) throw new Error('Top Student should be rank #1');
        console.log('✅ Rank calculation correct');

        // 4. Test Spin Wheel
        console.log('\n4️⃣ Testing Spin Wheel...');
        const spinRes = await fetch(`${API_URL}/gamification/spin-wheel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${topToken}` }
        });
        const spinData = await spinRes.json();
        console.log('Spin Result:', spinData.reward);

        if (!spinData.success || !spinData.reward) throw new Error('Spin failed');
        console.log('✅ Spin wheel successful');

        console.log('\n🎉 GAMIFICATION TEST PASSED!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
}

testGamification();
