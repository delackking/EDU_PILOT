async function testFlow() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                school_id: 1,
                school_assigned_id: 'STD001',
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Login successful. Token obtained.');

        // 2. Search
        console.log('\n2. Searching for "John"...');
        const searchUrl = new URL('http://localhost:5001/api/school/search');
        searchUrl.searchParams.append('query', 'John');
        searchUrl.searchParams.append('role', 'TEACHER');

        const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.statusText}`);
        const searchData = await searchRes.json();
        console.log('   Search Results:', JSON.stringify(searchData, null, 2));

        // 3. Stats
        console.log('\n3. Fetching Stats...');
        const statsRes = await fetch('http://localhost:5001/api/school/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!statsRes.ok) throw new Error(`Stats failed: ${statsRes.statusText}`);
        const statsData = await statsRes.json();
        console.log('   Stats Results:', JSON.stringify(statsData, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFlow();
