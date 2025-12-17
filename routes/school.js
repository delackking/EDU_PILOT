import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List all schools (for dropdown)
router.get('/list', (req, res) => {
    try {
        const schools = db.prepare('SELECT id, name, address FROM schools ORDER BY name').all();
        res.json(schools);
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search users within a school
router.get('/search', authenticateToken, (req, res) => {
    try {
        const { query, role } = req.query;
        const school_id = req.user.school_id;

        console.log(`🔍 Search Request: query="${query}", role="${role}", school_id=${school_id}, user_id=${req.user.id}`);

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        let sql = `
            SELECT id, name, role, school_assigned_id, role_details 
            FROM users 
            WHERE school_id = ? AND name LIKE ?
        `;
        const params = [school_id, `%${query}%`];

        if (role) {
            sql += ' AND role = ?';
            params.push(role);
        }

        const users = db.prepare(sql).all(...params);
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get School Stats / Leaderboard
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const school_id = req.user.school_id;

        // Top Students by XP (using student_profiles for now as XP is there)
        // We need to join with users to ensure they are in the same school
        const leaderboard = db.prepare(`
            SELECT u.name, u.school_assigned_id, sp.xp, sp.level, sp.class
            FROM student_profiles sp
            JOIN users u ON sp.user_id = u.id
            WHERE u.school_id = ?
            ORDER BY sp.xp DESC
            LIMIT 10
        `).all(school_id);

        res.json({
            leaderboard
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get School Analytics (Real-time)
router.get('/analytics', authenticateToken, (req, res) => {
    try {
        const school_id = req.user.school_id;

        // 1. Total Students & Teachers
        const counts = db.prepare(`
            SELECT role, COUNT(*) as count 
            FROM users 
            WHERE school_id = ? 
            GROUP BY role
        `).all(school_id);

        const studentCount = counts.find(c => c.role === 'STUDENT')?.count || 0;
        const teacherCount = counts.find(c => c.role === 'TEACHER')?.count || 0;

        // 2. Attendance Stats (Today)
        const today = new Date().toISOString().split('T')[0];
        const attendance = db.prepare(`
            SELECT status, COUNT(*) as count 
            FROM attendance 
            WHERE school_id = ? AND date = ? 
            GROUP BY status
        `).all(school_id, today);

        // 3. Average Marks/XP (Proxy for performance)
        const avgXP = db.prepare(`
            SELECT AVG(xp) as avg_xp 
            FROM student_profiles 
            WHERE school = (SELECT name FROM schools WHERE id = ?)
        `).get(school_id);

        res.json({
            overview: {
                students: studentCount,
                teachers: teacherCount,
                avg_xp: Math.round(avgXP.avg_xp || 0)
            },
            attendance: attendance,
            // Mocking some activity data for the graph until we have a real activity log
            activity: [
                { time: '8 AM', active: 120 },
                { time: '10 AM', active: 450 },
                { time: '12 PM', active: 380 },
                { time: '2 PM', active: 500 },
                { time: '4 PM', active: 200 },
            ]
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get School Directory (Teachers & Students)
router.get('/directory', authenticateToken, (req, res) => {
    try {
        const school_id = req.user.school_id;

        const teachers = db.prepare(`
            SELECT u.id, u.name, u.email, u.school_assigned_id, u.role_details, tp.subjects, tp.classes
            FROM users u
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            WHERE u.school_id = ? AND u.role = 'TEACHER'
        `).all(school_id);

        const students = db.prepare(`
            SELECT u.id, u.name, u.school_assigned_id, u.role_details, sp.class, sp.section, sp.xp
            FROM users u
            LEFT JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.school_id = ? AND u.role = 'STUDENT'
            ORDER BY sp.class, sp.section, u.name
        `).all(school_id);

        res.json({ teachers, students });
    } catch (error) {
        console.error('Error fetching directory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Whole Student Profile (Aggregated Data)
router.get('/student/:id/whole-profile', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const school_id = req.user.school_id;

        // 1. Basic Profile
        const student = db.prepare(`
            SELECT u.id, u.name, u.school_assigned_id, u.email, sp.*
            FROM users u
            JOIN student_profiles sp ON u.id = sp.user_id
            WHERE u.id = ? AND u.school_id = ?
        `).get(id, school_id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 2. Attendance Stats
        const attendanceStats = db.prepare(`
            SELECT status, COUNT(*) as count
            FROM attendance
            WHERE user_id = ?
            GROUP BY status
        `).all(id);

        const totalDays = attendanceStats.reduce((sum, item) => sum + item.count, 0);
        const presentDays = attendanceStats.find(s => s.status === 'PRESENT')?.count || 0;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // 3. Mastery / Academic Stats
        const mastery = db.prepare(`
            SELECT t.subject, AVG(m.score) as avg_score, COUNT(m.id) as topics_covered
            FROM mastery m
            JOIN topics t ON m.topic_id = t.id
            WHERE m.student_id = ?
            GROUP BY t.subject
        `).all(student.id); // student.id is profile id

        // 4. Mistake Logs (Weaknesses)
        const mistakes = db.prepare(`
            SELECT t.name as topic, q.content as question, ml.mistake_type, ml.timestamp
            FROM mistake_logs ml
            JOIN questions q ON ml.question_id = q.id
            JOIN topics t ON q.topic_id = t.id
            WHERE ml.student_id = ?
            ORDER BY ml.timestamp DESC
            LIMIT 5
        `).all(student.id);

        // 5. Emotion Logs (Behavioral)
        const emotions = db.prepare(`
            SELECT emotion, COUNT(*) as count
            FROM emotion_logs
            WHERE student_id = ?
            GROUP BY emotion
        `).all(student.id);

        res.json({
            profile: student,
            attendance: {
                percentage: attendancePercentage,
                breakdown: attendanceStats
            },
            academics: mastery,
            mistakes: mistakes,
            emotions: emotions
        });

    } catch (error) {
        console.error('Error fetching whole profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
