import express from 'express';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import CandidateReview from '../models/CandidateReview.js';
import Job from '../models/Job.js';
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

// Start or continue interview
router.post('/generate', auth, async (req, res) => {
    try {
        const { resume, jobRole, jobRequirements, previousMessages } = req.body;

        const reqsString = Array.isArray(jobRequirements) ? jobRequirements.join(', ') : (jobRequirements || 'Not specified');

        // Construct the context prompt for AJ Assistant
        const systemInstruction = `You are 'AJ Assistant', an expert technical HR interviewer for SkillCortex. 
    You are interviewing a candidate for the role of ${jobRole}. 
    Job Requirements: ${reqsString}. 
    Candidate's Resume extract: ${resume}.
    
    Your goal is to conduct a professional, step-by-step interview. Ask one technical or behavioral question at a time based on their resume and the job requirements. 
    Crucially, explicitly test their knowledge on the specific tech stack and tools they have listed on their resume.
    Keep your responses concise, conversational, and evaluate their immediate previous answer before asking the next question.
    Do NOT break character.`;

        // Convert previous generic chat messages to Gemini history format if needed
        // For simplicity, we just pass the formatted prompt as a single generation call, appending previous context.

        let conversationHistory = `System: ${systemInstruction}\n`;
        if (previousMessages && previousMessages.length > 0) {
            previousMessages.forEach(msg => {
                conversationHistory += `${msg.role === 'user' ? 'Candidate' : 'AJ Assistant'}: ${msg.content}\n`;
            });
        }
        conversationHistory += `AJ Assistant (Respond to the candidate's last message, evaluate it briefly if applicable, and ask the next logical interview question):`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversationHistory,
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error('AI Interview error details:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to generate AI response', error: error.message });
    }
});

// Evaluate Candidate Post-Interview
router.post('/evaluate', auth, async (req, res) => {
    try {
        const { jobId, transcript } = req.body;

        if (!jobId || !transcript || transcript.length === 0) {
            return res.status(400).json({ message: 'Missing job ID or interview transcript' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        console.log(`Generating review for candidate ${req.user.userId} on job ${jobId}`);

        let formattedTranscript = '';
        transcript.forEach(msg => {
            if (msg.role !== 'system') {
                formattedTranscript += `${msg.role === 'user' ? 'Candidate' : 'AI Interviewer'}: ${msg.content}\n`;
            }
        });

        const evaluationPrompt = `You are a Senior Technical Recruiter analyzing an AI-conducted interview transcript.
Job Title: ${job.title}
Job Requirements: ${job.requirements.join(', ')}

Transcript:
${formattedTranscript}

Analyze the candidate's performance. You must return your analysis as a strict JSON string (do not use markdown formatting like \`\`\`json) with the following two keys:
1. "score": A number out of 5 representing their overall technical capability and fitness for the role.
2. "feedback": A concise paragraph summarizing their strengths, weaknesses, and whether they are recommended to proceed to a human interview.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: evaluationPrompt,
        });

        let aiOutput = response.text.trim();
        // Fallback for json blocks if AI still outputs them
        if (aiOutput.startsWith('\`\`\`json')) {
            aiOutput = aiOutput.replace('\`\`\`json', '').replace('\`\`\`', '').trim();
        }

        let evaluationData;
        try {
            evaluationData = JSON.parse(aiOutput);
        } catch (e) {
            console.error("Failed to parse AI evaluation JSON", aiOutput);
            evaluationData = { score: 3, feedback: "Analysis parsing failed, but interview was completed." };
        }

        const newReview = new CandidateReview({
            jobId: job._id,
            jobTitle: job.title,
            hrId: job.postedBy, // The recruiter who created the job
            candidateId: req.user.userId,
            candidateName: req.user.name || "Candidate",
            aiScore: evaluationData.score || 0,
            aiFeedback: evaluationData.feedback || "No feedback generated.",
            transcript: transcript
        });

        await newReview.save();
        res.json({ message: 'Evaluation complete', reviewId: newReview._id });

    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({ message: 'Failed to evaluate interview' });
    }
});

export default router;
