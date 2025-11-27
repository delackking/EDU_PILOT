import express from 'express';
import multer from 'multer';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getAIExplanation, solveImageQuestion, getHint, detectMisconception } from '../services/groq.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/ai/tutor
 * Get AI explanation in different modes
 */
router.post('/tutor', async (req, res) => {
    try {
        const { topic, question, mode, context } = req.body;

        if (!topic || !question) {
            return res.status(400).json({ error: 'Topic and question are required' });
        }

        const explanation = await getAIExplanation(topic, question, mode, context);

        res.json({
            success: true,
            explanation,
            mode: mode || 'normal'
        });
    } catch (error) {
        console.error('AI Tutor error:', error);

        if (error.message === 'Gemini API not configured') {
            return res.status(503).json({
                error: 'AI features are not available. Please configure GEMINI_API_KEY.'
            });
        }

        res.status(500).json({ error: 'Failed to generate explanation' });
    }
});

/**
 * POST /api/ai/image-solve
 * Solve a question from an uploaded image
 */
router.post('/image-solve', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const solution = await solveImageQuestion(req.file.buffer, req.file.mimetype);

        res.json({
            success: true,
            solution,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error('Image solve error:', error);

        if (error.message === 'Gemini API not configured') {
            return res.status(503).json({
                error: 'AI features are not available. Please configure GEMINI_API_KEY.'
            });
        }

        res.status(500).json({ error: 'Failed to solve image question' });
    }
});

/**
 * POST /api/ai/hint
 * Get a hint for a question
 */
router.post('/hint', async (req, res) => {
    try {
        const { question, topic } = req.body;

        if (!question || !topic) {
            return res.status(400).json({ error: 'Question and topic are required' });
        }

        const hint = await getHint(question, topic);

        res.json({
            success: true,
            hint
        });
    } catch (error) {
        console.error('Hint generation error:', error);

        if (error.message === 'Gemini API not configured') {
            return res.status(503).json({
                error: 'AI features are not available. Please configure GEMINI_API_KEY.'
            });
        }

        res.status(500).json({ error: 'Failed to generate hint' });
    }
});

/**
 * POST /api/ai/check-misconception
 * Detect misconceptions in student's answer
 */
router.post('/check-misconception', async (req, res) => {
    try {
        const { question, studentAnswer, correctAnswer } = req.body;

        if (!question || !studentAnswer || !correctAnswer) {
            return res.status(400).json({
                error: 'Question, student answer, and correct answer are required'
            });
        }

        const analysis = await detectMisconception(question, studentAnswer, correctAnswer);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error('Misconception detection error:', error);

        if (error.message === 'Gemini API not configured') {
            return res.status(503).json({
                error: 'AI features are not available. Please configure GEMINI_API_KEY.'
            });
        }

        res.status(500).json({ error: 'Failed to analyze answer' });
    }
});

export default router;
