import express from 'express';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import { auth, isHR } from '../middleware/auth.js';
import { matchSkills } from '../services/matching.js';
import { notify } from '../services/notify.js';

const router = express.Router();

// POST /api/applications — apply (PRD §11)
router.post('/', auth, async (req, res) => {
    try {
        const { jobId, resumeId, resumeText } = req.body;
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        const existing = await Application.findOne({ jobId, candidateId: req.user.userId });
        if (existing) return res.status(400).json({ message: 'Already applied', application: existing });

        let resume = resumeId ? await Resume.findById(resumeId) : await Resume.findOne({ candidateId: req.user.userId }).sort({ createdAt: -1 });
        const jobSkills = [...(job.skills || []), ...(job.requirements || [])];
        const resumeSkills = resume?.skills || [];
        const { matched, missing, matchScore } = matchSkills(resumeSkills, jobSkills);

        const app = await Application.create({
            jobId, candidateId: req.user.userId, resumeId: resume?._id,
            status: 'ASSESSMENT_PENDING', matchScore, matchedSkills: matched, missingSkills: missing
        });
        await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });
        const candidate = await User.findById(req.user.userId);
        const hr = await User.findById(job.hrRef || job.postedBy);
        if (hr) await notify({ toUserId: hr._id, toEmail: hr.email, type: 'APPLICATION', subject: `New application: ${job.title}`, body: `${candidate?.name} applied to ${job.title} (match ${matchScore}%).` });
        if (candidate) await notify({ toUserId: candidate._id, toEmail: candidate.email, type: 'APPLICATION_CONFIRM', subject: `Applied: ${job.title}`, body: `You applied to ${job.title} at ${job.company}. Match score ${matchScore}%. Start your AI interview next.` });
        res.status(201).json({ application: app, matchScore, matchedSkills: matched, missingSkills: missing, resumeText: resume?.rawText || resumeText || '' });
    } catch (e) {
        console.error('Apply error:', e);
        res.status(500).json({ message: 'Failed to apply' });
    }
});

// GET /api/applications — own (candidate) or all-for-HR-jobs (hr)
router.get('/', auth, async (req, res) => {
    if (req.user.role === 'hr' || req.user.role === 'admin') {
        const jobs = await Job.find({ $or: [{ hrRef: req.user.userId }, { postedBy: req.user.userId }] }).select('_id');
        const apps = await Application.find({ jobId: { $in: jobs.map((j) => j._id) } }).populate('jobId candidateId', 'title company name email').sort({ createdAt: -1 });
        return res.json(apps);
    }
    const apps = await Application.find({ candidateId: req.user.userId }).populate('jobId').sort({ createdAt: -1 });
    res.json(apps);
});

router.get('/:id', auth, async (req, res) => {
    const app = await Application.findById(req.params.id).populate('jobId candidateId resumeId interviewId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
});

// PATCH /api/applications/:id/status — HR shortlist/reject/hire
router.patch('/:id/status', auth, isHR, async (req, res) => {
    const { status } = req.body;
    const allowed = ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED', 'ASSESSMENT_PENDING'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const app = await Application.findById(req.params.id).populate('jobId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    app.status = status;
    await app.save();
    const candidate = await User.findById(app.candidateId);
    if (candidate) await notify({ toUserId: candidate._id, toEmail: candidate.email, type: status, subject: `Update on ${app.jobId?.title}`, body: `Your application for ${app.jobId?.title} is now: ${status}.` });
    res.json(app);
});

export default router;
