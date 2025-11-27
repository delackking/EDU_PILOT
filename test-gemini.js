import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API with multiple models...\n');

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel(modelName) {
    try {
        console.log(`🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        const text = response.text();

        console.log(`✅ ${modelName} works!`);
        console.log(`   Response: ${text}\n`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} failed`);
        console.log(`   Error: ${error.message}\n`);
        return false;
    }
}

async function runTests() {
    const models = [
        'gemini-3-pro-preview',
    ];

    console.log('API Key prefix:', API_KEY.substring(0, 15) + '...\n');

    for (const model of models) {
        await testModel(model);
    }

    console.log('\n📋 Summary:');
    console.log('If all models failed with 404, your API key might need to be enabled.');
    console.log('Visit: https://makersuite.google.com/app/apikey');
    console.log('Or: https://aistudio.google.com/app/apikey');
}

runTests();
