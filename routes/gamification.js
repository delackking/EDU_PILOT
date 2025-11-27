import express from 'express';
import { db } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/gamification/leaderboard
 * Fetch leaderboard data
 * Query Params: type = 'global' | 'class'
 */
router.get('/leaderboard', (req, res) => {
    try {
        const { type } = req.query;
        const studentId = req.user.profileId;

        let query = '';
        let params = [];

        if (type === 'class') {
            // Get student's class first
            const student = db.prepare('SELECT class FROM student_profiles WHERE id = ?').get(studentId);
            if (!student) return res.status(404).json({ error: 'Student profile not found' });

            query = `
                SELECT u.name, sp.xp, sp.level, sp.streak, sp.id as student_id
                FROM student_profiles sp
                JOIN users u ON sp.user_id = u.id
                WHERE sp.class = ?
                ORDER BY sp.xp DESC
                LIMIT 10
            `;
            params = [student.class];
        } else {
            // Global Leaderboard
            query = `
                SELECT u.name, sp.xp, sp.level, sp.streak, sp.id as student_id
                FROM student_profiles sp
                JOIN users u ON sp.user_id = u.id
                ORDER BY sp.xp DESC
                LIMIT 10
            `;
        }

        const leaderboard = db.prepare(query).all(...params);

        // Find user's rank
        const rankQuery = type === 'class'
            ? `SELECT COUNT(*) + 1 as rank FROM student_profiles WHERE class = ? AND xp > (SELECT xp FROM student_profiles WHERE id = ?)`
            : `SELECT COUNT(*) + 1 as rank FROM student_profiles WHERE xp > (SELECT xp FROM student_profiles WHERE id = ?)`;

        const rankParams = type === 'class'
            ? [params[0], studentId]
            : [studentId];

        const userRank = db.prepare(rankQuery).get(...rankParams);

        res.json({
            leaderboard,
            userRank: userRank.rank
        });

    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * POST /api/gamification/spin-wheel
 * Spin the wheel for a daily reward
 */
router.post('/spin-wheel', (req, res) => {
    try {
        const studentId = req.user.profileId;

        // Check if already spun today (simplified check)
        // In production, we'd check a 'last_spin_date' in the DB

        // Reward Probabilities
        const rewards = [
            { type: 'XP', value: 50, probability: 0.4, label: '50 XP' },
            { type: 'XP', value: 100, probability: 0.3, label: '100 XP' },
            { type: 'XP', value: 200, probability: 0.15, label: '200 XP' },
            { type: 'BADGE', value: 'Lucky Spinner', probability: 0.1, label: 'Rare Badge' },
            { type: 'STREAK', value: 1, probability: 0.05, label: 'Streak Freeze' }
        ];

        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedReward = rewards[0];

        for (const reward of rewards) {
            cumulativeProbability += reward.probability;
            if (random <= cumulativeProbability) {
                selectedReward = reward;
                break;
            }
        }

        // Apply Reward
        if (selectedReward.type === 'XP') {
            db.prepare('UPDATE student_profiles SET xp = xp + ? WHERE id = ?').run(selectedReward.value, studentId);
        } else if (selectedReward.type === 'BADGE') {
            db.prepare('INSERT INTO rewards (student_id, xp_earned, badge, reason) VALUES (?, 0, ?, ?)')
                .run(studentId, selectedReward.value, 'Won from Spin Wheel');
        }
        // Streak logic would go here

        res.json({
            success: true,
            reward: selectedReward
        });

    } catch (error) {
        console.error('Spin wheel error:', error);
        res.status(500).json({ error: 'Spin failed' });
    }
});

export default router;
