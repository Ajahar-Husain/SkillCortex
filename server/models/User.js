import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, sparse: true, index: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['candidate', 'hr', 'admin'], default: 'candidate' },
    emailVerified: { type: Boolean, default: false },
    mobile: { type: String, default: '' },
    mobileVerified: { type: Boolean, default: false },
    skills: { type: [String], default: [] },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    company: { type: String, default: '' },
    emailOtp: {
        code: { type: String, select: false },
        expiresAt: { type: Date, select: false },
        attempts: { type: Number, default: 0, select: false }
    },
    mobileOtp: {
        code: { type: String, select: false },
        expiresAt: { type: Date, select: false },
        attempts: { type: Number, default: 0, select: false }
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    companyProfile: {
        website: { type: String, default: '' },
        size: { type: String, default: '' },
        industry: { type: String, default: '' },
        about: { type: String, default: '' },
        verified: { type: Boolean, default: false }
    },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    points: { type: Number, default: 0 },
    skillCoins: { type: Number, default: 0 },
    badges: [{
        name: String,
        level: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Elite'], default: 'Bronze' },
        awardedAt: { type: Date, default: Date.now },
        source: String
    }],
    streakDays: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
    enrolledCourses: [{ courseId: String, enrolledAt: Date, completed: { type: Boolean, default: false } }]
}, { timestamps: true });

// Mongoose 6+/9: async middleware receives NO `next` callback — declaring it
// made every save that reached this hook throw "next is not a function",
// which broke registration (and login whenever a user's streak was saved).
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
    return {
        id: this._id, _id: this._id, name: this.name, email: this.email, role: this.role,
        avatar: this.avatar, emailVerified: this.emailVerified, mobile: this.mobile,
        mobileVerified: this.mobileVerified, skills: this.skills, bio: this.bio,
        company: this.company, companyProfile: this.companyProfile, location: this.location,
        experienceYears: this.experienceYears, resumeId: this.resumeId, points: this.points,
        skillCoins: this.skillCoins, badges: this.badges, streakDays: this.streakDays,
        enrolledCourses: this.enrolledCourses
    };
};

export default mongoose.models.User || mongoose.model('User', userSchema);
