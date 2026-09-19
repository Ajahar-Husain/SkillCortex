import express from 'express';
import { auth } from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { geminiJSON } from '../services/gemini.js';
import { extractSkillsFromText, normalizeSkills } from '../services/matching.js';

const router = express.Router();

// POST /api/ai/resume-analyze (PRD)
router.post('/resume-analyze', auth, async (req, res) => {
    const { text } = req.body;
    if (!text || String(text).length < 20) return res.status(400).json({ message: 'Resume text required' });
    const heuristicSkills = extractSkillsFromText(text);
    const ai = await geminiJSON(
        `Extract structured resume data as JSON with keys: name, education, experienceLevel (Fresher/Junior/Mid/Senior), projects (array), skills (array), certifications (array), summary (1 sentence). Resume:\n${String(text).slice(0, 6000)}`,
        null
    );
    const skills = normalizeSkills([...heuristicSkills, ...((ai?.skills) || [])]);
    let resume = await Resume.findOne({ candidateId: req.user.userId }).sort({ createdAt: -1 });
    if (!resume) resume = new Resume({ candidateId: req.user.userId });
    resume.rawText = String(text).slice(0, 20000);
    resume.skills = skills;
    resume.experienceLevel = ai?.experienceLevel || resume.experienceLevel;
    resume.education = ai?.education || resume.education || '';
    resume.projects = ai?.projects || resume.projects || [];
    await resume.save();
    await User.findByIdAndUpdate(req.user.userId, { resumeId: resume._id, skills });
    res.json({ resumeId: resume._id, skills, experienceLevel: resume.experienceLevel, education: resume.education, projects: resume.projects, summary: ai?.summary || '', matchedSkills: [], missingSkills: [] });
});

// POST /api/ai/job-analyze (PRD)
router.post('/job-analyze', auth, async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description required' });
    const heuristic = extractSkillsFromText(description);
    const ai = await geminiJSON(
        `From this job description extract JSON {skills:[], experienceMin:number, experienceMax:number, responsibilities:string}. Description:\n${String(description).slice(0, 6000)}`,
        null
    );
    res.json({ skills: normalizeSkills([...heuristic, ...((ai?.skills) || [])]), experienceMin: ai?.experienceMin ?? 0, experienceMax: ai?.experienceMax ?? 3, responsibilities: ai?.responsibilities || '' });
});

// POST /api/ai/interview/question (PRD)
router.post('/interview/question', auth, async (req, res) => {
    const { jobRole, requirements, resume, difficulty, previousQA } = req.body;
    const { geminiText } = await import('../services/gemini.js');
    const q = await geminiText(
        `You are AJ Interviewer. Role: ${jobRole}. Requirements: ${(requirements || []).join(', ')}. Difficulty: ${difficulty || 'Intermediate'}. Resume: ${String(resume || '').slice(0, 2000)}. Previous Q&A: ${JSON.stringify(previousQA || []).slice(0, 2000)}. Ask ONE next interview question only (no preamble).`,
        { fallback: 'Explain a challenging project from your resume and the key technical decisions you made.' }
    );
    res.json({ question: q.trim() });
});

// POST /api/ai/interview/evaluate (PRD)
router.post('/interview/evaluate', auth, async (req, res) => {
    const { question, answer, jobRole } = req.body;
    const result = await geminiJSON(
        `Evaluate this interview answer as JSON {score (0-5), correctConcepts:[], missingConcepts:[], errors:[], feedback:string}. Role: ${jobRole}. Q: ${question}. A: ${answer}. Be strict and technical.`,
        { score: 3, correctConcepts: [], missingConcepts: [], errors: [], feedback: 'Answer recorded.' }
    );
    res.json(result);
});

// POST /api/ai/chat — Skill Assistant conversational endpoint.
// Sends the REAL user question + conversation history to Gemini. If the AI key is
// missing/rate-limited, falls back to a built-in knowledge base so the assistant
// ALWAYS answers the question actually asked (never a canned interview prompt).
import kb from '../data/knowledgeBase.js';

function genericAnswer(question) {
  const q = String(question).trim();
  return `Here is a structured way to approach that:\n\n1. **Clarify the concept** — what exactly "${q.slice(0, 80)}" means, in one sentence.\n2. **Why it exists** — the problem it solves and where it shows up in real projects.\n3. **How it works** — the key mechanics, data flow, or syntax involved.\n4. **Example** — a minimal, concrete code snippet or scenario.\n5. **Trade-offs** — when to use it vs the alternatives, plus common mistakes.\n\nFor a detailed answer right now, ask me about: Java, JavaScript, TypeScript, React, React Hooks, Python, SQL, MongoDB, Node.js, Express, Next.js, Docker, AWS, System Design, DSA, Git, CSS — or resume tips.`;
}

router.post('/chat', auth, async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!message || !String(message).trim()) return res.status(400).json({ message: 'Message is required' });

  const convo = (Array.isArray(history) ? history : [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content).slice(0, 500)}`)
    .join('\n');

  const { geminiText } = await import('../services/gemini.js');
  const ai = await geminiText(
    `You are "Skill Assistant", an expert technical mentor inside the SkillCortex hiring platform. Answer the user's latest question directly and helpfully — concepts, interview prep, resume tips, or coding help. Be accurate, concrete and well-structured (short paragraphs or numbered/bulleted points, use **bold** for key terms). Include a small code example when relevant. Keep the answer under 250 words. Do NOT ask the user to answer interview questions — you are the mentor, not the interviewer.${convo ? '\nConversation so far:\n' + convo : ''}\nUser: ${String(message).slice(0, 1000)}`,
    { fallback: '' }
  );

  if (ai && ai.trim()) return res.json({ reply: ai.trim(), source: 'ai' });

  // Offline knowledge-base fallback — score the question against known topics.
  const q = String(message).toLowerCase();
  const scored = Object.entries(kb)
    .map(([topic, answer]) => {
      let score = 0;
      if (q.includes(topic)) score += 5;
      for (const w of topic.split(/\s+|\//)) if (w.length > 2 && q.includes(w)) score += 2;
      return { topic, answer, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored[0]?.score >= 2) return res.json({ reply: scored[0].answer, source: 'kb', topic: scored[0].topic });
  return res.json({ reply: genericAnswer(message), source: 'fallback' });
});

// POST /api/ai/feedback (PRD) — skill-gap + learning recommendations
router.post('/feedback', auth, async (req, res) => {
    const { weakSkills, strongSkills } = req.body;
    const { geminiText } = await import('../services/gemini.js');
    const text = await geminiText(
        `Candidate strong skills: ${(strongSkills || []).join(', ')}. Weak skills: ${(weakSkills || []).join(', ')}. Give: 1) 3-line feedback 2) learning roadmap (4 steps) 3) 3 recommended course/blog topics. Keep concise.`,
        { fallback: 'Keep practicing fundamentals and build projects in your weak areas.' }
    );
    res.json({ feedback: text });
});

export default router;
