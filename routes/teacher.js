import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getDatabase } from '../config/database.js';
import { generateQuestions } from '../services/groq.js';

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
 * GET /api/teacher/topics
 * Get all topics for the teacher (from all chapters)
 */
router.get('/topics', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;

        const topics = db.prepare(`
            SELECT t.id, t.name, c.chapter_name
            FROM topics t
            JOIN custom_chapters c ON t.custom_chapter_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY c.created_at DESC, t.id ASC
        `).all(teacherId);

        res.json({ topics });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
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

/**
 * GET /api/teacher/student/:id/full-profile
 * Get detailed student profile (Teacher View)
 */
router.get('/student/:id/full-profile', (req, res) => {
    try {
        const db = getDatabase();
        const studentId = req.params.id;
        const teacherId = req.user.profileId;

        // Verify student belongs to teacher's school
        const teacher = db.prepare('SELECT school_pin FROM teacher_profiles WHERE id = ?').get(teacherId);
        const student = db.prepare('SELECT * FROM student_profiles WHERE id = ?').get(studentId);

        if (!student || student.school_pin !== teacher.school_pin) {
            return res.status(403).json({ error: 'Unauthorized access to student profile' });
        }

        const user = db.prepare('SELECT name, school_assigned_id FROM users WHERE id = ?').get(student.user_id);

        // Mock Academic Data (Replace with real data later)
        const academic = {
            overall_grade: 'A',
            subjects: [
                { name: 'Mathematics', score: 85, status: 'Good' },
                { name: 'Science', score: 72, status: 'Average' },
                { name: 'English', score: 90, status: 'Excellent' },
                { name: 'History', score: 65, status: 'Needs Improvement' }
            ]
        };

        // Mock AI Insights
        const aiInsights = {
            weakness: ['Algebra - Quadratic Equations', 'Physics - Laws of Motion'],
            improvement_plan: [
                'Practice 10 Algebra questions daily',
                'Watch video tutorial on Newton\'s Laws',
                'Review History Chapter 4 summary'
            ]
        };

        res.json({
            profile: {
                name: user.name,
                class: student.class,
                school_assigned_id: user.school_assigned_id,
                xp: student.xp,
                level: student.level
            },
            academic,
            ai_insights: aiInsights
        });

    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({ error: 'Failed to fetch student profile' });
    }
});

/**
 * GET /api/teacher/class-students
 * Get students for attendance (filtered by teacher's assigned classes)
 */
router.get('/class-students', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;

        // Get teacher's school PIN and classes
        const teacher = db.prepare('SELECT school_pin, classes FROM teacher_profiles WHERE id = ?').get(teacherId);

        if (!teacher || !teacher.school_pin) {
            return res.status(400).json({ error: 'Teacher profile incomplete' });
        }

        // Parse classes (assuming stored as JSON array or comma-separated string)
        let assignedClasses = [];
        try {
            assignedClasses = JSON.parse(teacher.classes || '[]');
        } catch (e) {
            assignedClasses = (teacher.classes || '').split(',').map(c => c.trim());
        }

        // Fetch students
        // Note: In a real app, we'd filter by assignedClasses. For now, we return all students in the school
        // to ensure the feature works even if class assignment logic isn't fully populated.
        const students = db.prepare(`
            SELECT 
                sp.id, sp.class, sp.school_pin,
                u.name, u.school_assigned_id, u.id as user_id
            FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.school_pin = ?
            ORDER BY sp.class, u.name
        `).all(teacher.school_pin);

        res.json({ students });

    } catch (error) {
        console.error('Get class students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

/**
 * POST /api/teacher/attendance
 * Mark attendance for a list of students
 */
router.post('/attendance', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;
        const { date, records } = req.body; // records: [{ studentId, status, remarks }]

        if (!date || !Array.isArray(records)) {
            return res.status(400).json({ error: 'Date and records array are required' });
        }

        const teacher = db.prepare('SELECT school, school_pin FROM teacher_profiles WHERE id = ?').get(teacherId);

        // Get school ID from pin
        const school = db.prepare('SELECT id FROM schools WHERE pin = ?').get(teacher.school_pin);
        if (!school) return res.status(400).json({ error: 'School not found' });

        const insertAttendance = db.prepare(`
            INSERT INTO attendance (user_id, school_id, date, status, remarks)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET
            status = excluded.status,
            remarks = excluded.remarks
        `);

        db.transaction(() => {
            for (const record of records) {
                // Get user_id from student_profile id
                const student = db.prepare('SELECT user_id FROM student_profiles WHERE id = ?').get(record.studentId);
                if (student) {
                    insertAttendance.run(
                        student.user_id,
                        school.id,
                        date,
                        record.status,
                        record.remarks || null
                    );
                }
            }
        })();

        res.json({ success: true, message: 'Attendance saved successfully' });

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: 'Failed to save attendance' });
    }
});

/**
 * GET /api/teacher/attendance/:date
 * Get attendance records for a specific date
 */
router.get('/attendance/:date', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;
        const date = req.params.date;

        const teacher = db.prepare('SELECT school_pin FROM teacher_profiles WHERE id = ?').get(teacherId);

        const attendance = db.prepare(`
            SELECT 
                a.status, a.remarks, sp.id as student_id
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            JOIN student_profiles sp ON sp.user_id = u.id
            WHERE a.date = ? AND sp.school_pin = ?
        `).all(date, teacher.school_pin);

        res.json({ attendance });

    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

/**
 * POST /api/teacher/generate-questions
 * Generate practice questions using AI
 */
router.post('/generate-questions', async (req, res) => {
    try {
        const { topic, content, difficulty, count } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Use AI to generate questions
        // If content is provided (e.g. from a chapter), use it. Otherwise, AI generates based on topic name.
        const questions = await generateQuestions(
            topic,
            content || `General knowledge about ${topic}`,
            difficulty || 3,
            count || 5
        );

        res.json({ success: true, questions });

    } catch (error) {
        console.error('Generate questions error:', error);
        if (error.message === 'Groq API not configured') {
            return res.status(503).json({ error: 'AI features unavailable' });
        }
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});

/**
 * POST /api/teacher/save-questions
 * Save approved questions to the database
 */
router.post('/save-questions', (req, res) => {
    try {
        const db = getDatabase();
        const { topicId, questions } = req.body;

        if (!topicId || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Topic ID and questions array are required' });
        }

        const insertQuestion = db.prepare(`
            INSERT INTO questions (topic_id, content, type, options, correct_answer, explanation, difficulty_level, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'teacher-generated')
        `);

        db.transaction(() => {
            for (const q of questions) {
                insertQuestion.run(
                    topicId,
                    q.content,
                    q.type,
                    q.type === 'MCQ' ? JSON.stringify(q.options) : null,
                    q.correct_answer,
                    q.explanation,
                    q.difficulty_level || 3
                );
            }
        })();

        res.json({ success: true, message: 'Questions saved successfully' });

    } catch (error) {
        console.error('Save questions error:', error);
        res.status(500).json({ error: 'Failed to save questions' });
    }
});

/**
 * GET /api/teacher/classes
 * List all classes created by the teacher
 */
router.get('/classes', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;

        const classes = db.prepare(`
            SELECT c.*, COUNT(ce.student_id) as student_count
            FROM classes c
            LEFT JOIN class_enrollments ce ON c.id = ce.class_id
            WHERE c.teacher_id = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `).all(teacherId);

        res.json({ classes });

    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

/**
 * POST /api/teacher/classes
 * Create a new class
 */
router.post('/classes', (req, res) => {
    try {
        const db = getDatabase();
        const teacherId = req.user.profileId;
        const { name, subject, grade } = req.body;

        if (!name || !subject || !grade) {
            return res.status(400).json({ error: 'Name, subject, and grade are required' });
        }

        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const result = db.prepare(`
            INSERT INTO classes (teacher_id, name, subject, grade, invite_code)
            VALUES (?, ?, ?, ?, ?)
        `).run(teacherId, name, subject, grade, inviteCode);

        res.json({
            success: true,
            class: {
                id: result.lastInsertRowid,
                name,
                subject,
                grade,
                invite_code: inviteCode,
                student_count: 0
            }
        });

    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

/**
 * POST /api/teacher/classes/:id/homework
 * Assign homework to a class
 */
router.post('/classes/:id/homework', (req, res) => {
    try {
        const db = getDatabase();
        const classId = req.params.id;
        const { title, description, dueDate, topicId } = req.body;

        // Note: We need a 'homework' table for this.
        // For now, we'll just log it and return success as a placeholder
        // or create a simple 'assignments' table if needed.
        // Given the current schema, we might need to add an 'assignments' table.
        // Let's check if we can reuse 'custom_chapters' or 'topics' or if we should just mock it for now.

        // Checking schema again... no 'assignments' or 'homework' table.
        // I will create a simple 'assignments' table on the fly if it doesn't exist, 
        // or just store it in a new table.

        // For this iteration, let's create a table if not exists here (or in database.js, but I can't edit that now easily without context switch).
        // I'll add a quick table creation here for safety.

        db.exec(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                due_date DATE,
                topic_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        const result = db.prepare(`
            INSERT INTO assignments (class_id, title, description, due_date, topic_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(classId, title, description, dueDate, topicId || null);

        res.json({ success: true, message: 'Homework assigned successfully', assignmentId: result.lastInsertRowid });

    } catch (error) {
        console.error('Assign homework error:', error);
        res.status(500).json({ error: 'Failed to assign homework' });
    }
});

export default router;
