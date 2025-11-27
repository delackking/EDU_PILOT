import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not set. AI features will be disabled.');
}

const groq = API_KEY ? new Groq({ apiKey: API_KEY }) : null;

/**
 * Get AI explanation in different modes using Groq/Llama
 * @param {string} topic - Topic name
 * @param {string} question - Question or concept to explain
 * @param {string} mode - Explanation mode (ELI5, story, analogy, technical, step-by-step)
 * @param {string} context - Additional context (optional)
 */
export async function getAIExplanation(topic, question, mode = 'normal', context = '') {
    if (!groq) {
        throw new Error('Groq API not configured');
    }

    const prompts = {
        eli5: `Explain this concept to a 5-year-old child in very simple terms:
Topic: ${topic}
Question: ${question}
${context ? `Context: ${context}` : ''}

Use simple words, everyday examples, and make it fun and engaging. Keep it under 150 words.`,

        story: `Create an engaging story that teaches this concept:
Topic: ${topic}
Question: ${question}
${context ? `Context: ${context}` : ''}

Make it interesting with characters, a plot, and a clear lesson. Keep it under 200 words.`,

        analogy: `Explain this concept using a clear, relatable analogy:
Topic: ${topic}
Question: ${question}
${context ? `Context: ${context}` : ''}

Use an analogy that students in Classes 1-8 can relate to. Explain how the analogy maps to the concept.`,

        technical: `Provide a detailed technical explanation:
Topic: ${topic}
Question: ${question}
${context ? `Context: ${context}` : ''}

Include definitions, formulas (if applicable), and precise terminology. Suitable for advanced students.`,

        'step-by-step': `Provide a step-by-step explanation:
Topic: ${topic}
Question: ${question}
${context ? `Context: ${context}` : ''}

Break it down into clear, numbered steps. Make each step easy to follow.`,

        normal: `Explain this concept clearly:
Topic: ${topic}
Question: ${question}
${context ? `Context: ${context}` : ''}

Provide a clear, educational explanation suitable for students in Classes 1-8.`
    };

    const prompt = prompts[mode] || prompts.normal;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert AI tutor helping students in Classes 1-8 learn various subjects. Provide clear, engaging, and age-appropriate explanations."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate AI explanation');
    }
}

/**
 * Solve a question from an image using Groq Vision
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} mimeType - Image MIME type
 */
export async function solveImageQuestion(imageBuffer, mimeType) {
    if (!groq) {
        throw new Error('Groq API not configured');
    }

    // Note: Groq's vision capabilities are limited compared to Gemini
    // For now, we'll return a helpful message
    throw new Error('Image analysis is not yet supported with Groq API. Please use text-based questions.');
}

/**
 * Generate practice questions for a topic
 * @param {string} topicName - Topic name
 * @param {string} topicContent - Topic content/theory
 * @param {number} difficulty - Difficulty level (1-5)
 * @param {number} count - Number of questions to generate
 */
export async function generateQuestions(topicName, topicContent, difficulty = 3, count = 5) {
    if (!groq) {
        throw new Error('Groq API not configured');
    }

    const prompt = `Generate ${count} practice questions for this topic:

Topic: ${topicName}
Content: ${topicContent}
Difficulty Level: ${difficulty}/5

Generate a mix of:
- Multiple Choice Questions (MCQ) with 4 options
- Fill in the Blank questions
- Short Answer questions

For each question, provide:
1. Question text
2. Type (MCQ/FILL_BLANK/SHORT)
3. Options (for MCQ only, as array)
4. Correct answer
5. Explanation

Return as JSON array with this structure:
[
  {
    "content": "question text",
    "type": "MCQ",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_answer": "option1",
    "explanation": "why this is correct"
  }
]`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert question generator for educational content. Generate valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.8,
            max_tokens: 1000,
        });

        const text = completion.choices[0]?.message?.content || '';

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Failed to parse generated questions');
    } catch (error) {
        console.error('Question generation error:', error);
        throw new Error('Failed to generate questions');
    }
}

/**
 * Detect misconceptions in student's answer
 * @param {string} question - The question
 * @param {string} studentAnswer - Student's answer
 * @param {string} correctAnswer - Correct answer
 */
export async function detectMisconception(question, studentAnswer, correctAnswer) {
    if (!groq) {
        throw new Error('Groq API not configured');
    }

    const prompt = `Analyze this student's answer to detect misconceptions:

Question: ${question}
Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Identify:
1. What misconception the student might have
2. Why they might have this misconception
3. How to correct it with a simple explanation

Be encouraging and constructive.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a patient and encouraging AI tutor who helps students learn from their mistakes."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 400,
        });

        return completion.choices[0]?.message?.content || 'No analysis available';
    } catch (error) {
        console.error('Misconception detection error:', error);
        throw new Error('Failed to detect misconception');
    }
}

/**
 * Get personalized hint for a question
 * @param {string} question - The question
 * @param {string} topic - Topic context
 */
export async function getHint(question, topic) {
    if (!groq) {
        throw new Error('Groq API not configured');
    }

    const prompt = `Provide a helpful hint (not the full answer) for this question:

Topic: ${topic}
Question: ${question}

Give a hint that guides the student toward the solution without revealing the answer directly.
Keep it under 50 words.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful tutor who provides hints without giving away the answer."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.6,
            max_tokens: 100,
        });

        return completion.choices[0]?.message?.content || 'No hint available';
    } catch (error) {
        console.error('Hint generation error:', error);
        throw new Error('Failed to generate hint');
    }
}

export default {
    getAIExplanation,
    solveImageQuestion,
    generateQuestions,
    detectMisconception,
    getHint
};
