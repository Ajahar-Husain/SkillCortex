import express from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded; // { userId, role }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Generate Mock Quiz for a specific tech stack
router.post('/generate', auth, async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Tech stack topic is required' });
        }

        const prompt = `You are an expert technical interviewer. Generate a technical multiple-choice quiz about ${topic}.
The quiz must contain exactly 5 challenging questions.
You must return your response STRICTLY as a JSON array of objects. Do not wrap it in markdown block quotes (no \`\`\`json). Just the raw JSON array.
Each object must have the following structure:
{
  "question": "The technical question string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answerIndex": 0 // The integer index (0-3) of the correct option in the options array
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let aiOutput = response.text.trim();
        if (aiOutput.startsWith('\`\`\`json')) {
            aiOutput = aiOutput.replace('\`\`\`json', '').replace('\`\`\`', '').trim();
        } else if (aiOutput.startsWith('\`\`\`')) {
            aiOutput = aiOutput.replace('\`\`\`', '').replace('\`\`\`', '').trim();
        }

        let questions;
        try {
            questions = JSON.parse(aiOutput);
        } catch (e) {
            console.error("Failed to parse quiz JSON:", aiOutput);
            return res.status(500).json({ message: 'Failed to generate valid quiz data from AI' });
        }

        res.json({ questions });
    } catch (error) {
        console.error('Quiz Generation error:', error);
        res.status(500).json({ message: 'Server error generating quiz' });
    }
});

export default router;
