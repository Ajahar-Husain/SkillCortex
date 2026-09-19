import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { extractSkillsFromText } from '../services/matching.js';
import { geminiJSON } from '../services/gemini.js';

const router = express.Router();

// 5 MB cap + extension/mimetype allow-list. Final correctness is enforced by
// magic-byte sniffing inside the resume service — this filter only rejects
// obvious junk early with a clear multer error the client can display.
const ALLOWED_EXT = /\.(pdf|docx?|txt|csv)$/i;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      ALLOWED_EXT.test(file.originalname) ||
      /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml|text\/(plain|csv))/.test(file.mimetype || '');
    if (!ok) return cb(new Error('Unsupported file format. Please upload a PDF, DOCX, TXT or CSV file.'));
    cb(null, true);
  },
});

// Shared handler: parse failures are the client's fault (bad file) → 422 with
// the specific user-facing message from the resume service.
async function parseResumeFile(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const { extractText } = await import('../services/resume.js');
    const text = await extractText(req.file);
    return res.json({ text });
  } catch (e) {
    return res.status(422).json({ message: e.message || 'Error parsing resume' });
  }
}

router.post('/resume', upload.single('resume'), (req, res) => parseResumeFile(req, res));

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { extractText } = await import('../services/resume.js');
    const text = await extractText(req.file);
    const skills = extractSkillsFromText(text);
    const ai = await geminiJSON('Extract JSON {education, experienceLevel, projects[]} from resume:\n' + text.slice(0, 4000), null);
    const resume = await Resume.create({ candidateId: req.user.userId, fileName: req.file.originalname, rawText: text.slice(0, 20000), skills, education: ai?.education || '', experienceLevel: ai?.experienceLevel || '', projects: ai?.projects || [] });
    await User.findByIdAndUpdate(req.user.userId, { resumeId: resume._id, skills });
    res.status(201).json({ resumeId: resume._id, text, skills });
  } catch (e) {
    // Parse problems (bad file) are 422 with the user-facing message;
    // everything else is a genuine server fault.
    const parseIssue = /format|PDF|DOCX|paste|empty|readable/i.test(e.message || '');
    res.status(parseIssue ? 422 : 500).json({ message: e.message || 'Error parsing resume' });
  }
});

router.get('/', auth, async (req, res) => {
  res.json(await Resume.find({ candidateId: req.user.userId }).sort({ createdAt: -1 }));
});

router.get('/:id', auth, async (req, res) => {
  const r = await Resume.findOne({ _id: req.params.id, candidateId: req.user.userId });
  if (!r) return res.status(404).json({ message: 'Not found' });
  res.json(r);
});

// Multer errors (file filter, size limit) arrive here via next(err) — convert
// them into clean JSON responses instead of Express' default HTML 500.
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5 MB).' : err.message;
    return res.status(413).json({ message });
  }
  return res.status(422).json({ message: err.message || 'Upload failed' });
});

export default router;
