import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    score: Number,
    feedback: String,
    // PRD §25 — multi-dimensional scoring (correctness / relevance / depth / clarity / confidence)
    dimensions: mongoose.Schema.Types.Mixed,
    // PRD §26 — anti-hallucination: structured evidence grounded in expected concepts
    evidence: mongoose.Schema.Types.Mixed,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const integrityEventSchema = new mongoose.Schema(
  { type: { type: String, required: true }, detail: String, at: { type: Date, default: Date.now }, durationSec: Number },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    sessionId: { type: String, unique: true, index: true },
    durationMin: { type: Number, default: 10 },
    difficulty: { type: String, enum: ['Easy', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    numQuestions: { type: Number, default: 8 },
    questions: { type: [String], default: [] },
    answers: { type: [answerSchema], default: [] },
    transcript: [{ role: String, content: String }],
    integrityEvents: { type: [integrityEventSchema], default: [] },
    integrityFlagged: { type: Boolean, default: false },
    readiness: mongoose.Schema.Types.Mixed,
    codingAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingAssessment' },
    startedAt: Date,
    completedAt: Date,
    serverDeadlineAt: Date,
    lastHeartbeatAt: Date,
    pausedAt: Date,
    timeSpentSec: Number,
    scoringWeights: mongoose.Schema.Types.Mixed,
    technicalScore: Number,
    codingScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    resumeMatchScore: Number,
    integrityScore: Number,
    overallScore: Number,
    recommendation: { type: String, enum: ['EXCEPTIONAL', 'STRONG', 'GOOD', 'REVIEW', 'WEAK', 'NOT_RECOMMENDED'], default: 'REVIEW' },
    recommendationReason: String,
    report: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['CREATED', 'READY_CHECK', 'STARTED', 'QUESTIONING', 'CODING_TASK', 'FINAL_QUESTION', 'SUBMITTING', 'ANALYZING', 'COMPLETED', 'REPORTED', 'DISCONNECTED', 'PAUSED', 'FAILED', 'CANCELLED', 'FLAGGED'],
      default: 'CREATED',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
