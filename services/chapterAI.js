import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.1-8b-instant';

/**
 * Process chapter text to generate structured educational content
 * @param {string} text - Raw text from PDF
 * @param {string} subject - Subject name
 * @param {number} grade - Grade level
 * @returns {Promise<Array>} - Array of topics with content and questions
 */
export async function processChapterContent(text, subject, grade) {
    console.log(`🤖 AI Processing started for ${subject} Grade ${grade}`);

    try {
        // 1. Extract Topics
        const topics = await extractTopics(text, subject, grade);
        console.log(`📝 Identified ${topics.length} topics`);

        const processedTopics = [];

        // 2. Generate Content for each topic
        for (const topic of topics) {
            console.log(`Processing topic: ${topic.name}`);

            // Generate Theory & Explanations
            const content = await generateTopicContent(topic.name, text, grade);

            // Generate Questions
            const questions = await generateQuestions(topic.name, content.theory, grade);

            processedTopics.push({
                name: topic.name,
                ...content,
                questions
            });
        }

        return processedTopics;

    } catch (error) {
        console.error('AI Processing Error:', error);
        throw error;
    }
}

async function extractTopics(text, subject, grade) {
    const prompt = `
        Analyze the following text from a Grade ${grade} ${subject} textbook chapter.
        Identify 3-5 main educational topics or concepts covered.
        Return ONLY a JSON array of objects with a "name" field.
        Example: [{"name": "Photosynthesis"}, {"name": "Chlorophyll"}]
        
        Text (truncated): ${text.substring(0, 15000)}
    `;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.topics || response; // Handle potential wrapper object
}

async function generateTopicContent(topicName, contextText, grade) {
    const prompt = `
        Create educational content for the topic "${topicName}" for a Grade ${grade} student.
        Use the provided context if relevant, but ensure the explanation is complete.
        
        Return a JSON object with these fields:
        - theory: A clear, academic explanation (2-3 paragraphs).
        - eli5: "Explain Like I'm 5" - a very simple analogy or explanation.
        - story: A short, engaging story or scenario illustrating the concept.
        - examples: A list of 3 real-world examples.

        Context: ${contextText.substring(0, 5000)}...
    `;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
}

async function generateQuestions(topicName, theory, grade) {
    const prompt = `
        Generate 5 practice questions for the topic "${topicName}" (Grade ${grade}).
        Based on this theory: "${theory.substring(0, 1000)}..."

        Return a JSON object with a "questions" array. Each question must have:
        - content: The question text.
        - type: "MCQ", "FILL_BLANK", or "SHORT".
        - options: Array of 4 strings (only for MCQ, null otherwise).
        - correct_answer: The correct answer string.
        - explanation: Brief explanation of why it's correct.
        - difficulty_level: 1-5 (integer).
    `;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.questions || [];
}
