import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY;

console.log('Testing Groq API with Llama 3.1 8B Instant...\n');
console.log('API Key exists:', !!API_KEY);
console.log('API Key prefix:', API_KEY?.substring(0, 15) + '...\n');

if (!API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env file');
    console.log('\n📝 To get a Groq API key:');
    console.log('1. Visit: https://console.groq.com/keys');
    console.log('2. Sign up (free)');
    console.log('3. Create an API key');
    console.log('4. Add to .env: GROQ_API_KEY=your_key_here\n');
    process.exit(1);
}

const groq = new Groq({ apiKey: API_KEY });

async function testAPI() {
    try {
        console.log('🧪 Testing Llama 3.1 8B Instant model...\n');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI tutor."
                },
                {
                    role: "user",
                    content: "Explain photosynthesis in one sentence."
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 100,
        });

        const response = completion.choices[0]?.message?.content;

        console.log('✅ Groq API Test Successful!\n');
        console.log('Model:', completion.model);
        console.log('Response:', response);
        console.log('\n🎉 Your AI Tutor is ready to use!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Groq API Test Failed!\n');
        console.error('Error:', error.message);

        if (error.message.includes('401')) {
            console.log('\n💡 Your API key might be invalid. Get a new one from:');
            console.log('   https://console.groq.com/keys');
        }

        process.exit(1);
    }
}

testAPI();
