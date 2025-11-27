import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getDatabase } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'chapters');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// All routes require teacher authentication
router.use(authenticateToken);
router.use(authorizeRole('TEACHER'));

/**
 * POST /api/teacher/upload-chapter
 * Upload PDF chapter (simplified version)
 */
router.post('/upload-chapter', upload.single('pdf'), async (req, res) => {
    console.log('📤 Upload request received');

    try {
        if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

        const { subject, grade, chapterName } = req.body;
        if (!subject || !grade) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Subject and grade are required' });
        }

        const db = getDatabase();
        const teacherId = req.user.profileId;

        // 1. Create Initial Record
        const result = db.prepare(`
            INSERT INTO custom_chapters (teacher_id, subject, grade, chapter_name, pdf_path, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'processing', datetime('now'))
        `).run(teacherId, subject, parseInt(grade), chapterName || req.file.originalname.replace('.pdf', ''), req.file.filename);

        const chapterId = result.lastInsertRowid;
        console.log(`✅ Chapter created (ID: ${chapterId}), starting AI processing...`);

        // 2. Send Response Immediately (Async Processing)
        res.json({
            success: true,
            message: 'Upload successful! AI is processing your chapter.',
            chapterId,
            status: 'processing'
        });

        // 3. Background Processing
        (async () => {
            try {
                const { extractTextFromPDF } = await import('../services/pdfProcessor.js');
                const { processChapterContent } = await import('../services/chapterAI.js');

                // Extract Text
                const text = await extractTextFromPDF(req.file.path);

                // Generate Content
                const topics = await processChapterContent(text, subject, parseInt(grade));

                // Save to Database
                const insertTopic = db.prepare(`
                    INSERT INTO topics (name, subject, grade, custom_chapter_id, source, status, theory, eli5, story, examples)
                    VALUES (?, ?, ?, ?, 'ai-generated', 'published', ?, ?, ?, ?)
                `);

                const insertQuestion = db.prepare(`
                    INSERT INTO questions (topic_id, content, type, options, correct_answer, explanation, difficulty_level, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'ai-generated')
                `);

                const updateChapter = db.prepare(`
                    UPDATE custom_chapters 
                    SET status = 'completed', topics_count = ?, questions_count = ?, processed_at = datetime('now')
                    WHERE id = ?
                `);

                let totalQuestions = 0;

                db.transaction(() => {
                    for (const topic of topics) {
                        const topicResult = insertTopic.run(
                            topic.name,
                            subject,
                            parseInt(grade),
                            chapterId,
                            topic.theory,
                            topic.eli5,
                            topic.story,
                            JSON.stringify(topic.examples)
                        );

                        const topicId = topicResult.lastInsertRowid;

                        for (const q of topic.questions) {
                            insertQuestion.run(
                                topicId,
                                q.content,
                                q.type,
                                q.type === 'MCQ' ? JSON.stringify(q.options) : null,
                                q.correct_answer,
                                q.explanation,
                                q.difficulty_level
                            );
                            totalQuestions++;
                        }
                    }

                    updateChapter.run(topics.length, totalQuestions, chapterId);
                })();

                console.log(`✅ AI Processing Complete for Chapter ${chapterId}`);

            } catch (err) {
                console.error(`❌ AI Processing Failed for Chapter ${chapterId}:`, err);
                db.prepare(`UPDATE custom_chapters SET status = 'failed', error_message = ? WHERE id = ?`)
                    .run(err.message, chapterId);
            }
        })();

    } catch (error) {
        console.error('❌ Upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to upload chapter' });
    }
});

/**
 * GET /api/teacher/chapters
 * Get all chapters uploaded by teacher
 */
router.get('/chapters', (req, res) => {
    console.log('📚 Fetching chapters for teacher:', req.user.id);
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;

        const chapters = db.prepare(`
            SELECT 
                id, subject, grade, chapter_name, status,
                topics_count, questions_count,
                created_at, processed_at, error_message
            FROM custom_chapters
            WHERE teacher_id = ?
            ORDER BY created_at DESC
        `).all(teacherId);

        console.log(`✅ Found ${chapters.length} chapters`);
        res.json({ chapters });
    } catch (error) {
        console.error('❌ Get chapters error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch chapters', details: error.message });
    }
});

/**
 * GET /api/teacher/chapter/:id
 * Get chapter details
 */
router.get('/chapter/:id', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;
        const chapterId = req.params.id;

        const chapter = db.prepare(`
            SELECT * FROM custom_chapters
            WHERE id = ? AND teacher_id = ?
        `).get(chapterId, teacherId);

        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        // Get topics (if any)
        const topics = db.prepare(`
            SELECT id, name, difficulty, status, theory, eli5, story, examples
            FROM topics
            WHERE custom_chapter_id = ?
            ORDER BY id
        `).all(chapterId);

        // Get questions for each topic
        const topicsWithQuestions = topics.map(topic => {
            const questions = db.prepare(`
                SELECT id, content, type, options, correct_answer, explanation
                FROM questions
                WHERE topic_id = ?
            `).all(topic.id);

            return { ...topic, questions };
        });

        res.json({
            chapter,
            topics: topicsWithQuestions
        });
    } catch (error) {
        console.error('Get chapter details error:', error);
        res.status(500).json({ error: 'Failed to fetch chapter details' });
    }
});

/**
 * DELETE /api/teacher/chapter/:id
 * Delete chapter
 */
router.delete('/chapter/:id', (req, res) => {
    try {
        const db = getDatabase();
        const chapterId = req.params.id;
        const teacherId = req.user.profileId;

        const chapter = db.prepare(`
            SELECT * FROM custom_chapters
            WHERE id = ? AND teacher_id = ?
        `).get(chapterId, teacherId);

        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        // Delete PDF file
        const pdfPath = path.join(__dirname, '..', 'uploads', 'chapters', chapter.pdf_path);
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }

        // Delete chapter (cascade will handle topics and questions)
        db.prepare(`DELETE FROM custom_chapters WHERE id = ?`).run(chapterId);

        res.json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error('Delete chapter error:', error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
});


/**
 * GET /api/teacher/my-students
 * Get all students in the teacher's school (matching PIN)
 */
router.get('/my-students', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;

        // Get teacher's school PIN
        const teacher = db.prepare('SELECT school_pin, school FROM teacher_profiles WHERE id = ?').get(teacherId);

        if (!teacher || !teacher.school_pin) {
            return res.status(400).json({ error: 'Teacher profile incomplete (missing School PIN)' });
        }

        // Find students with matching PIN
        const students = db.prepare(`
            SELECT 
                sp.id, sp.class, sp.school, sp.xp, sp.level, sp.streak,
                u.name, u.email,
                (SELECT COUNT(*) FROM mastery m WHERE m.student_id = sp.id AND m.status = 'MASTERED') as mastered_topics,
                (SELECT COUNT(*) FROM mastery m WHERE m.student_id = sp.id AND m.status = 'WEAK') as weak_topics
            FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.school_pin = ?
            ORDER BY sp.class, u.name
        `).all(teacher.school_pin);

        res.json({
            school: teacher.school,
            pin: teacher.school_pin,
            students
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * POST /api/teacher/student-feedback
 * Add feedback and performance score for a student
 */
router.post('/student-feedback', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;
        const { studentId, feedback, performanceScore } = req.body;

        if (!studentId || !feedback) {
            return res.status(400).json({ error: 'Student ID and feedback are required' });
        }

        db.prepare(`
            INSERT INTO student_feedback (student_id, teacher_id, feedback, performance_score)
            VALUES (?, ?, ?, ?)
        `).run(studentId, teacherId, feedback, performanceScore || 0);

        res.json({ success: true, message: 'Feedback added successfully' });

    } catch (error) {
        console.error('Add feedback error:', error);
        res.status(500).json({ error: 'Failed to add feedback' });
    }
});

export default router;
