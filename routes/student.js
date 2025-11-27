import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication as STUDENT
router.use(authenticateToken);
router.use(authorizeRole('STUDENT'));

// Get all subjects (unique from topics)
router.get('/subjects', (req, res) => {
    try {
        const subjects = db.prepare(`
      SELECT DISTINCT subject 
      FROM topics 
      ORDER BY subject
    `).all();

        res.json(subjects.map(s => s.subject));
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get topics by subject
router.get('/subjects/:subject/topics', (req, res) => {
    try {
        const { subject } = req.params;
        const studentId = req.user.profileId;

        // Get student's grade
        const student = db.prepare('SELECT class FROM student_profiles WHERE id = ?').get(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const topics = db.prepare(`
      SELECT * FROM topics 
      WHERE subject = ? AND grade = ?
      ORDER BY difficulty
    `).all(subject, student.class);

        res.json(topics);
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Get single topic
router.get('/topics/:id', (req, res) => {
    try {
        const { id } = req.params;
        const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(id);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        res.json(topic);
    } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({ error: 'Failed to fetch topic' });
    }
});

// Get practice questions for a topic
router.get('/practice/:topicId/questions', (req, res) => {
    try {
        const { topicId } = req.params;
        const questions = db.prepare(`
      SELECT * FROM questions 
      WHERE topic_id = ? 
      ORDER BY difficulty_level, RANDOM()
      LIMIT 10
    `).all(topicId);

        res.json(questions);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Submit answer and update mastery
router.post('/practice/submit', (req, res) => {
    try {
        const { questionId, answer, topicId, correct } = req.body;
        const studentId = req.user.profileId;

        // Check if mastery record exists
        const existingMastery = db.prepare(`
      SELECT * FROM mastery 
      WHERE student_id = ? AND topic_id = ?
    `).get(studentId, topicId);

        if (existingMastery) {
            // Update existing mastery
            const newScore = correct ?
                Math.min(100, existingMastery.score + 10) :
                Math.max(0, existingMastery.score - 5);

            let status = 'WEAK';
            if (newScore >= 80) status = 'MASTERED';
            else if (newScore >= 50) status = 'DEVELOPING';

            db.prepare(`
        UPDATE mastery 
        SET score = ?, status = ?, last_reviewed = CURRENT_TIMESTAMP, revision_count = revision_count + 1
        WHERE id = ?
      `).run(newScore, status, existingMastery.id);

            // Update student XP
            if (correct) {
                db.prepare(`
          UPDATE student_profiles 
          SET xp = xp + 10 
          WHERE id = ?
        `).run(studentId);
            }
        } else {
            // Create new mastery record
            const initialScore = correct ? 10 : 0;
            db.prepare(`
        INSERT INTO mastery (student_id, topic_id, score, status, last_reviewed, revision_count)
        VALUES (?, ?, ?, 'WEAK', CURRENT_TIMESTAMP, 1)
      `).run(studentId, topicId, initialScore);

            if (correct) {
                db.prepare(`
          UPDATE student_profiles 
          SET xp = xp + 10 
          WHERE id = ?
        `).run(studentId);
            }
        }

        // Log mistake if incorrect
        if (!correct) {
            db.prepare(`
        INSERT INTO mistake_logs (student_id, question_id, mistake_type, timestamp)
        VALUES (?, ?, 'CONCEPTUAL', CURRENT_TIMESTAMP)
      `).run(studentId, questionId);
        }

        res.json({
            success: true,
            correct,
            message: correct ? 'Great job!' : 'Keep practicing!'
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// Get student dashboard data
router.get('/student/dashboard', (req, res) => {
    try {
        const studentId = req.user.profileId;

        const profile = db.prepare('SELECT * FROM student_profiles WHERE id = ?').get(studentId);
        const masteryData = db.prepare(`
      SELECT t.subject, m.status, COUNT(*) as count
      FROM mastery m
      JOIN topics t ON m.topic_id = t.id
      WHERE m.student_id = ?
      GROUP BY t.subject, m.status
    `).all(studentId);

        res.json({
            profile,
            mastery: masteryData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;
