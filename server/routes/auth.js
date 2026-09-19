import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { issueAuth, touchStreak } from '../services/gamify.js';
import { notify } from '../services/notify.js';

const router = express.Router();

const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// Register Route (PRD POST /api/auth/register)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, company, mobile } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

        const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({
            name: String(name).trim(),
            email: String(email).toLowerCase().trim(),
            password,
            role: ['candidate', 'hr', 'admin'].includes(role) ? role : 'candidate',
            company: company || '',
            mobile: mobile || '',
            emailOtp: { code: genOtp(), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 }
        });
        await user.save();
        await touchStreak(user);
        const payload = issueAuth(user);
        await notify({ toUserId: user._id, toEmail: user.email, type: 'WELCOME', subject: 'Welcome to SkillCortex', body: `Hi ${user.name}, welcome to SkillCortex! Verify your email with code ${user.emailOtp.code}.` });
        res.status(201).json({ ...payload, verifyHint: 'Email OTP sent (dev: check notifications).' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// Login Route (PRD POST /api/auth/login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
        if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        await touchStreak(user);
        res.json(issueAuth(user));
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Verify token route (useful for AuthContext on frontend)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.toSafeJSON());
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});
// Google login (PRD POST /api/auth/google)
router.post('/google', async (req, res) => {
    try {
        const { email, name, avatar, googleId } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        let user = await User.findOne({ email: String(email).toLowerCase().trim() });
        if (!user) {
            user = new User({
                name: name || String(email).split('@')[0],
                email: String(email).toLowerCase().trim(),
                googleId: googleId || undefined,
                avatar: avatar || '',
                emailVerified: true,
                role: req.body.role === 'hr' ? 'hr' : 'candidate'
            });
            await user.save();
            await notify({ toUserId: user._id, toEmail: user.email, type: 'WELCOME', subject: 'Welcome to SkillCortex', body: `Hi ${user.name}, welcome via Google!` });
        } else if (googleId && !user.googleId) {
            user.googleId = googleId;
            user.emailVerified = true;
            if (avatar && !user.avatar) user.avatar = avatar;
            await user.save();
        }
        await touchStreak(user);
        res.json(issueAuth(user));
    } catch (e) {
        console.error('Google auth error:', e);
        res.status(500).json({ message: 'Google login failed' });
    }
});

// OTP endpoints (PRD: send/verify email + mobile OTP)
router.post('/send-email-otp', auth, async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.emailOtp = { code: genOtp(), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 };
    await user.save();
    await notify({ toUserId: user._id, toEmail: user.email, type: 'OTP', subject: 'Your SkillCortex verification code', body: `Your verification code is ${user.emailOtp.code}. It expires in 10 minutes.` });
    res.json({ message: 'OTP sent', devCode: process.env.NODE_ENV !== 'production' ? user.emailOtp.code : undefined });
});

router.post('/verify-email-otp', auth, async (req, res) => {
    const { code } = req.body;
    const user = await User.findById(req.user.userId).select('+emailOtp');
    if (!user?.emailOtp?.code) return res.status(400).json({ message: 'No OTP pending' });
    if (new Date() > new Date(user.emailOtp.expiresAt)) return res.status(400).json({ message: 'OTP expired' });
    if (String(code) !== String(user.emailOtp.code)) return res.status(400).json({ message: 'Invalid OTP' });
    user.emailVerified = true;
    user.emailOtp = undefined;
    await user.save();
    res.json({ message: 'Email verified', user: user.toSafeJSON() });
});

router.post('/send-mobile-otp', auth, async (req, res) => {
    const { mobile } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (mobile) user.mobile = mobile;
    user.mobileOtp = { code: genOtp(), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 };
    await user.save();
    await notify({ toUserId: user._id, toEmail: user.email, type: 'OTP', subject: 'Your SkillCortex mobile code', body: `Your mobile verification code is ${user.mobileOtp.code}.` });
    res.json({ message: 'Mobile OTP sent', devCode: process.env.NODE_ENV !== 'production' ? user.mobileOtp.code : undefined });
});

router.post('/verify-mobile-otp', auth, async (req, res) => {
    const { code } = req.body;
    const user = await User.findById(req.user.userId).select('+mobileOtp');
    if (!user?.mobileOtp?.code) return res.status(400).json({ message: 'No OTP pending' });
    if (new Date() > new Date(user.mobileOtp.expiresAt)) return res.status(400).json({ message: 'OTP expired' });
    if (String(code) !== String(user.mobileOtp.code)) return res.status(400).json({ message: 'Invalid OTP' });
    user.mobileVerified = true;
    user.mobileOtp = undefined;
    await user.save();
    res.json({ message: 'Mobile verified', user: user.toSafeJSON() });
});

// Forgot / reset password (PRD)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });
    if (!user) return res.json({ message: 'If the account exists, a reset link was sent' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await notify({ toUserId: user._id, toEmail: user.email, type: 'PASSWORD_RESET', subject: 'Reset your SkillCortex password', body: `Use this reset token within 1 hour: ${token}` });
    res.json({ message: 'If the account exists, a reset link was sent', devToken: process.env.NODE_ENV !== 'production' ? token : undefined });
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token }).select('+resetPasswordToken +resetPasswordExpires +password');
    if (!user || !user.resetPasswordExpires || new Date() > new Date(user.resetPasswordExpires)) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
});

// Refresh (PRD POST /api/auth/refresh)
router.post('/refresh', auth, async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(issueAuth(user));
});

router.post('/logout', (_req, res) => res.json({ message: 'Logged out' }));

// Update own profile
router.patch('/profile', auth, async (req, res) => {
    const allowed = ['name', 'bio', 'skills', 'location', 'experienceYears', 'company', 'companyProfile', 'avatar', 'mobile'];
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    for (const k of allowed) if (req.body[k] !== undefined) user[k] = req.body[k];
    await user.save();
    res.json(user.toSafeJSON());
});

export default router;
