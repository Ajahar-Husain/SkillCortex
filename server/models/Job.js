import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    responsibilities: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    location: { type: String, default: '' },
    salary: { type: String, default: '' },
    salaryMin: Number,
    salaryMax: Number,
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 5 },
    employmentType: { type: String, enum: ['Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance', ''], default: '' },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'Office', ''], default: '' },
    department: { type: String, default: '' },
    applicants: { type: Number, default: 0 },
    verifiedEmployer: { type: Boolean, default: false },
    urgentHiring: { type: Boolean, default: false },
    premiumEmployer: { type: Boolean, default: false },
    hrRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'closed', 'Open', 'Closed'], default: 'open' },
    interviewConfig: {
        enabled: { type: Boolean, default: true },
        durationMin: { type: Number, default: 10 },
        difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Advanced'], default: 'Intermediate' },
        numQuestions: { type: Number, default: 8 },
        passingScore: { type: Number, default: 70 },
        integrityMonitoring: { type: Boolean, default: true }
    },
    codingConfig: {
        required: { type: Boolean, default: false },
        assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingAssessment' },
        title: { type: String, default: '' }
    }
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model('Job', jobSchema);
