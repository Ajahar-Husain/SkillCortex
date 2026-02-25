import express from 'express';
import jwt from 'jsonwebtoken';
import Job from '../models/Job.js';
import CandidateReview from '../models/CandidateReview.js';

const router = express.Router();

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

// HR Middleware
const isHR = (req, res, next) => {
    if (req.user.role !== 'hr') {
        return res.status(403).json({ message: 'Access denied. HR only.' });
    }
    next();
};

// Get all open jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Post a new job (HR ONLY)
router.post('/', auth, isHR, async (req, res) => {
    try {
        const { title, company, description, requirements, location, salary } = req.body;

        // Convert requirements back to array if sent as string
        const reqArray = typeof requirements === 'string' ? requirements.split(',').map(r => r.trim()) : requirements;

        const newJob = new Job({
            title,
            company,
            description,
            requirements: reqArray,
            location,
            salary,
            hrRef: req.user.userId
        });

        const savedJob = await newJob.save();
        res.json(savedJob);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Get single job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Job not found' });
        res.status(500).send('Server Error');
    }
});

// Get candidate reviews for HR
router.get('/reviews', auth, isHR, async (req, res) => {
    try {
        const reviews = await CandidateReview.find({ hrId: req.user.userId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews", error);
        res.status(500).json({ message: 'Server Error fetching candidate reviews' });
    }
});

export default router;
