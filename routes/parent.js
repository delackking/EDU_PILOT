import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication as PARENT
router.use(authenticateToken);
router.use(authorizeRole('PARENT'));

/**
 * GET /api/parent/dashboard
 * Fetch parent profile and list of linked children with basic stats
 */
router.get('/dashboard', (req, res) => {
    try {
        const parentId = req.user.profileId;

        // Get linked children
        const children = db.prepare(`
            SELECT 
                sp.id, sp.user_id, u.name, u.email, 
                sp.class, sp.school, sp.xp, sp.streak, sp.level,
                pc.relationship
            FROM parent_children pc
            JOIN student_profiles sp ON pc.student_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE pc.parent_id = ?
        `).all(parentId);

        res.json({ children });
    } catch (error) {
        console.error('Parent dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

/**
 * POST /api/parent/link-child
 * Link a student by email
 */
router.post('/link-child', (req, res) => {
    try {
        const { studentEmail, relationship } = req.body;
        const parentId = req.user.profileId;

        if (!studentEmail || !relationship) {
            return res.status(400).json({ error: 'Student email and relationship are required' });
        }

        // 1. Find student by email
        const studentUser = db.prepare('SELECT id FROM users WHERE email = ? AND role = "STUDENT"').get(studentEmail);

        if (!studentUser) {
            return res.status(404).json({ error: 'Student account not found with this email' });
        }

        // 2. Get student profile
        const studentProfile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(studentUser.id);

        if (!studentProfile) {
            return res.status(404).json({ error: 'Student profile not initialized' });
        }

        // 3. Check if already linked
        const existingLink = db.prepare(`
            SELECT id FROM parent_children 
            WHERE parent_id = ? AND student_id = ?
        `).get(parentId, studentProfile.id);

        if (existingLink) {
            return res.status(400).json({ error: 'Child is already linked to your account' });
        }

        // 4. Create link
        db.prepare(`
            INSERT INTO parent_children (parent_id, student_id, relationship)
            VALUES (?, ?, ?)
        `).run(parentId, studentProfile.id, relationship);

        res.json({ success: true, message: 'Child linked successfully!' });

    } catch (error) {
        console.error('Link child error:', error);
        res.status(500).json({ error: 'Failed to link child' });
    }
});

/**
 * GET /api/parent/child/:studentId/analytics
 * Fetch detailed performance data
 */
router.get('/child/:studentId/analytics', (req, res) => {
    try {
        const { studentId } = req.params;
        const parentId = req.user.profileId;

        // Verify ownership
        const link = db.prepare(`
            SELECT id FROM parent_children 
            WHERE parent_id = ? AND student_id = ?
        `).get(parentId, studentId);

        if (!link) {
            return res.status(403).json({ error: 'Not authorized to view this child' });
        }

        // 1. Mastery by Subject
        const masteryBySubject = db.prepare(`
            SELECT t.subject, AVG(m.score) as avg_score, COUNT(m.id) as topics_covered
            FROM mastery m
            JOIN topics t ON m.topic_id = t.id
            WHERE m.student_id = ?
            GROUP BY t.subject
        `).all(studentId);

        // 2. Recent Activity (Last 5 mastery updates)
        const recentActivity = db.prepare(`
            SELECT t.name as topic, t.subject, m.score, m.status, m.last_reviewed
            FROM mastery m
            JOIN topics t ON m.topic_id = t.id
            WHERE m.student_id = ?
            ORDER BY m.last_reviewed DESC
            LIMIT 5
        `).all(studentId);

        // 3. Weak Areas (Score < 50)
        const weakAreas = db.prepare(`
            SELECT t.name, t.subject, m.score
            FROM mastery m
            JOIN topics t ON m.topic_id = t.id
            WHERE m.student_id = ? AND m.score < 50
            ORDER BY m.score ASC
            LIMIT 3
        `).all(studentId);

        // 4. Strong Areas (Score > 80)
        const strongAreas = db.prepare(`
            SELECT t.name, t.subject, m.score
            FROM mastery m
            JOIN topics t ON m.topic_id = t.id
            WHERE m.student_id = ? AND m.score >= 80
            ORDER BY m.score DESC
            LIMIT 3
        `).all(studentId);

        // 5. Attendance Stats
        const attendanceStats = db.prepare(`
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) as late_days
            FROM attendance
            WHERE user_id = (SELECT user_id FROM student_profiles WHERE id = ?)
        `).get(studentId);

        // 6. Overall Grade (Mocked logic based on mastery for now)
        const totalMastery = db.prepare('SELECT COUNT(*) as count FROM mastery WHERE student_id = ?').get(studentId);
        const masteredCount = db.prepare("SELECT COUNT(*) as count FROM mastery WHERE student_id = ? AND status = 'MASTERED'").get(studentId);

        let overallGrade = 'B';
        if (totalMastery.count > 0) {
            const percentage = (masteredCount.count / totalMastery.count) * 100;
            if (percentage >= 90) overallGrade = 'A+';
            else if (percentage >= 80) overallGrade = 'A';
            else if (percentage >= 70) overallGrade = 'B';
            else if (percentage >= 60) overallGrade = 'C';
            else overallGrade = 'D';
        }

        res.json({
            masteryBySubject,
            recentActivity,
            weakAreas,
            strongAreas,
            attendance: {
                present: attendanceStats.present_days || 0,
                absent: attendanceStats.absent_days || 0,
                late: attendanceStats.late_days || 0,
                total: attendanceStats.total_days || 0,
                percentage: attendanceStats.total_days ? Math.round((attendanceStats.present_days / attendanceStats.total_days) * 100) : 100
            },
            overallGrade
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/parent/child/:studentId/alerts
 * Generate dynamic alerts
 */
router.get('/child/:studentId/alerts', (req, res) => {
    try {
        const { studentId } = req.params;
        const parentId = req.user.profileId;

        // Verify ownership
        const link = db.prepare(`
            SELECT id FROM parent_children 
            WHERE parent_id = ? AND student_id = ?
        `).get(parentId, studentId);

        if (!link) return res.status(403).json({ error: 'Not authorized' });

        const alerts = [];

        // 1. Inactivity Alert
        const lastActivity = db.prepare(`
            SELECT last_reviewed FROM mastery 
            WHERE student_id = ? 
            ORDER BY last_reviewed DESC 
            LIMIT 1
        `).get(studentId);

        if (lastActivity) {
            const daysSince = (new Date() - new Date(lastActivity.last_reviewed)) / (1000 * 60 * 60 * 24);
            if (daysSince > 3) {
                alerts.push({
                    type: 'warning',
                    message: 'Child hasn\'t practiced in over 3 days.',
                    action: 'Encourage them to log in!'
                });
            }
        } else {
            alerts.push({
                type: 'info',
                message: 'No activity yet.',
                action: 'Help your child start their first lesson.'
            });
        }

        // 2. Low Mastery Alert
        const lowMastery = db.prepare(`
            SELECT COUNT(*) as count FROM mastery 
            WHERE student_id = ? AND status = 'WEAK'
        `).get(studentId);

        if (lowMastery.count > 3) {
            alerts.push({
                type: 'critical',
                message: `${lowMastery.count} topics need attention.`,
                action: 'Review weak areas in Analytics.'
            });
        }

        // 3. High Achievement Alert
        const highMastery = db.prepare(`
            SELECT COUNT(*) as count FROM mastery 
            WHERE student_id = ? AND status = 'MASTERED'
        `).get(studentId);

        if (highMastery.count > 0 && highMastery.count % 5 === 0) {
            alerts.push({
                type: 'success',
                message: `Milestone reached: ${highMastery.count} topics mastered!`,
                action: 'Celebrate this achievement!'
            });
        }

        res.json({ alerts });

    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router;
