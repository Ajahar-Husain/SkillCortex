import express from 'express';
import { auth, isHR } from '../middleware/auth.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import CandidateReview from '../models/CandidateReview.js';
import Interview from '../models/Interview.js';
import CodeSubmission from '../models/CodeSubmission.js';

const router = express.Router();

// HR analytics (PRD 74): funnel per job + averages
router.get('/hr', auth, isHR, async (req, res) => {
  const jobs = await Job.find({ $or: [{ hrRef: req.user.userId }, { postedBy: req.user.userId }] }).select('_id title');
  const ids = jobs.map((j) => j._id);
  const apps = await Application.find({ jobId: { $in: ids } });
  const reviews = await CandidateReview.find({ hrId: req.user.userId });
  const interviews = await Interview.find({ jobId: { $in: ids } });
  const byStatus = {};
  apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
  const avgScore = reviews.length ? Math.round(reviews.reduce((s, r) => s + (r.aiScore100 || 0), 0) / reviews.length) : 0;
  const codingSubs = await CodeSubmission.find({ assessmentId: { $exists: true } }).limit(200);
  res.json({
    activeJobs: jobs.length,
    applications: apps.length,
    interviews: interviews.length,
    qualified: reviews.filter((r) => (r.aiScore100 || 0) >= 70).length,
    shortlisted: byStatus.SHORTLISTED || 0,
    avgScore,
    funnel: byStatus,
    perJob: jobs.map((j) => ({ jobId: j._id, title: j.title, applications: apps.filter((a) => String(a.jobId) === String(j._id)).length }))
  });
});

// Candidate analytics
router.get('/me', auth, async (req, res) => {
  const apps = await Application.find({ candidateId: req.user.userId }).populate('jobId', 'title company');
  const reviews = await CandidateReview.find({ candidateId: req.user.userId }).sort({ createdAt: -1 });
  const user = await User.findById(req.user.userId);
  const history = reviews.map((r) => ({ date: r.createdAt, score: r.aiScore100, job: r.jobTitle, recommendation: r.recommendation }));
  res.json({ applications: apps.length, interviews: reviews.length, avgScore: reviews.length ? Math.round(reviews.reduce((s, r) => s + (r.aiScore100 || 0), 0) / reviews.length) : 0, history, points: user.points, coins: user.skillCoins, badges: user.badges, streak: user.streakDays });
});

export default router;
