import express from 'express';
import crypto from 'crypto';
import { auth } from '../middleware/auth.js';
import CodingAssessment from '../models/CodingAssessment.js';
import CodeSubmission from '../models/CodeSubmission.js';
import { awardPoints } from '../services/gamify.js';

const router = express.Router();

// GET /api/assessments/:id
router.get('/:id', auth, async (req, res) => {
  const a = await CodingAssessment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Assessment not found' });
  const pub = a.toObject();
  pub.testCases = pub.testCases.map((t, i) => (t.hidden ? { hidden: true, index: i, description: 'Hidden test' } : { ...t, index: i }));
  res.json(pub);
});

// POST /api/assessments — create (HR)
router.post('/', auth, async (req, res) => {
  if (!['hr', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'HR only' });
  const a = await CodingAssessment.create(req.body);
  res.status(201).json(a);
});

// Safe JS runner: runs solution(code) against test cases in-process with timeout.
// PRD requires isolated sandbox in production; this MVP runner validates logic only for JS.
async function runJsTests(code, testCases, timeoutMs = 2000) {
  const results = [];
  let passed = 0;
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const started = Date.now();
    try {
      const fn = new Function('input', '"use strict";\n' + code + '\n;return (typeof solution === "function" ? solution(input) : undefined);');
      const run = Promise.resolve().then(() => fn(tc.input));
      const actual = await Promise.race([run, new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), timeoutMs))]);
      const ok = JSON.stringify(actual) === JSON.stringify(tc.expected);
      if (ok) passed++;
      results.push({ index: i, hidden: !!tc.hidden, passed: ok, actual: JSON.stringify(actual)?.slice(0, 500), expected: JSON.stringify(tc.expected)?.slice(0, 500), runtimeMs: Date.now() - started });
    } catch (e) {
      results.push({ index: i, hidden: !!tc.hidden, passed: false, error: String(e.message).slice(0, 500), runtimeMs: Date.now() - started });
    }
  }
  return { passed, total: testCases.length, results };
}

// POST /api/assessments/:id/run — public + hidden tests
router.post('/:id/run', auth, async (req, res) => {
  const a = await CodingAssessment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  const { code, language } = req.body;
  if ((language || a.language) !== 'javascript') return res.status(400).json({ message: 'MVP runner supports javascript only' });
  if (/require\s*\(|process\.|child_process|fs\.|eval\s*\(|Function\s*\(|while\s*\(\s*true/.test(code || '')) return res.status(400).json({ message: 'Blocked: unsafe code pattern' });
  const { passed, total, results } = await runJsTests(code, a.testCases);
  res.json({ passed, total, score: Math.round((passed / Math.max(1, total)) * 100), results });
});

// POST /api/assessments/:id/submit
router.post('/:id/submit', auth, async (req, res) => {
  const a = await CodingAssessment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  const { code, language, interviewId } = req.body;
  const { passed, total, results } = await runJsTests(code, a.testCases);
  const score = Math.round((passed / Math.max(1, total)) * 100);
  const sub = await CodeSubmission.create({ assessmentId: a._id, interviewId, candidateId: req.user.userId, language: language || a.language, code, passed, total, results, score });
  await awardPoints(req.user.userId, { points: passed === total ? 75 : 25, coins: passed === total ? 75 : 25 });
  res.status(201).json(sub);
});

router.get('/submissions/:id', auth, async (req, res) => {
  const s = await CodeSubmission.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

export default router;
