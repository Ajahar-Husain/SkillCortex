import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    jobTitle: { type: String, required: true },
    hrId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateName: { type: String, required: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    aiScore: { type: Number, required: true },
    aiScore100: { type: Number, default: 0 },
    aiFeedback: { type: String, required: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    questionAnalysis: [{
        question: String, answer: String, score: Number, review: String, improvement: String
    }],
    // PRD §26 — anti-hallucination evidence trail: each question keeps the
    // dimensions scored and the expected concepts the answer did / did not cover.
    questionEvidence: [{
        question: String,
        answer: String,
        score: Number,
        review: String,
        improvement: String,
        dimensions: mongoose.Schema.Types.Mixed,
        coveredConcepts: { type: [String], default: [] },
        missedConcepts: { type: [String], default: [] },
    }],
    codingResult: { passed: Number, total: Number, score: Number, language: String, submissionId: mongoose.Schema.Types.ObjectId },
    integritySummary: { tabSwitches: Number, fullscreenExits: Number, copyPaste: Number, devtools: Number, totalEvents: Number, level: String, score: Number, events: [String] },
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    recommendation: { type: String, default: 'REVIEW' },
    recommendationReason: String,
    // PRD §66 — recruiter-facing decision payload (forward / hold / reject).
    finalRecommendation: { type: String, default: 'REVIEW' },
    finalConfidence: { type: Number, default: 0 },
    hrAction: String,
    // PRD §30 / §32 — recruiter decision audit trail (shortlist / reject / hold).
    hrDecision: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED'], default: 'PENDING', index: true },
    hrDecisionNote: String,
    hrDecidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hrDecidedAt: Date,
    // PRD §24 / §61 / §65 — integrity and fairness signals escalate a candidate to a
    // human instead of auto-rejecting them.
    flaggedForHumanReview: { type: Boolean, default: false, index: true },
    transcript: [{
        role: String,
        content: String
    }]
}, { timestamps: true });

export default mongoose.models.CandidateReview || mongoose.model('CandidateReview', reviewSchema);
