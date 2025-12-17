import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.1-8b-instant';

/**
 * Generate a personalized learning plan based on student data
 * @param {Object} studentData - Student's performance data
 * @param {Array} weakAreas - List of weak topics
 * @param {Array} recentMistakes - List of recent mistakes
 */
export async function generateLearningPlan(studentData, weakAreas, recentMistakes) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('Groq API not configured');
    }

    const prompt = `
        Analyze this student's performance and generate a personalized learning plan for today.
        
        Student Profile:
        - Grade: ${studentData.class}
        - Recent Score: ${studentData.recentScore || 'N/A'}
        
        Weak Areas:
        ${weakAreas.map(w => `- ${w.subject}: ${w.topic} (Score: ${w.score}%)`).join('\n')}
        
        Recent Mistakes:
        ${recentMistakes.map(m => `- Question: "${m.question}" (Mistake: ${m.mistake_type})`).join('\n')}
        
        Task:
        1. Identify the ONE most critical topic to focus on right now.
        2. Explain WHY this is the priority (based on the data).
        3. Create a 3-step action plan (e.g., "Review concept X", "Practice 5 questions", "Watch a video on Y").
        4. Suggest a specific resource type (Video, Quiz, or Reading).

        Return ONLY a JSON object with this structure:
        {
            "priority_topic": "Topic Name",
            "subject": "Subject Name",
            "reason": "Brief explanation of why this is important.",
            "action_plan": [
                "Step 1: ...",
                "Step 2: ...",
                "Step 3: ..."
            ],
            "recommended_resource": "Quiz"
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert academic counselor and AI tutor. You analyze data to create actionable study plans."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: MODEL,
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Learning Plan Generation Error:', error);
        throw new Error('Failed to generate learning plan');
    }
}
