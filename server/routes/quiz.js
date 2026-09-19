import express from 'express';
import { auth } from '../middleware/auth.js';
import { geminiJSON } from '../services/gemini.js';
import { awardPoints } from '../services/gamify.js';

const router = express.Router();

// Generate Mock Quiz for a specific tech stack
router.post('/generate', auth, async (req, res) => {
    try {
        const { topic, difficulty = 'Intermediate' } = req.body;
        if (!topic) return res.status(400).json({ message: 'Tech stack topic is required' });
        const questions = await geminiJSON('Generate exactly 5 challenging multiple-choice questions about ' + topic + ' (' + difficulty + '). Return ONLY a JSON array of {question, options[4], answerIndex 0-3, explanation}.', null);
        if (!Array.isArray(questions) || questions.length !== 5) {
            return res.status(500).json({ message: 'Failed to generate valid quiz data from AI' });
        }
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ message: 'Server error generating quiz' });
    }
});

// Submit quiz result -> Skill Coins + badges (PRD 34-35)
router.post('/submit', auth, async (req, res) => {
    const { topic, score, total = 5 } = req.body;
    const pct = Math.round(((score || 0) / total) * 100);
    const coins = pct >= 80 ? 50 : pct >= 60 ? 30 : 10;
    const badge = pct >= 80 ? { name: (topic || 'Quiz') + ' Quiz', level: pct === 100 ? 'Gold' : 'Silver', source: 'quiz' } : null;
    const user = await awardPoints(req.user.userId, { points: coins, coins, badge });
    res.json({ coins, points: user.points, badges: user.badges });
});

export default router;
