import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingAssessment', required: true, index: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    results: [{ index: Number, hidden: Boolean, passed: Boolean, actual: String, expected: String, error: String, runtimeMs: Number }],
    runtimeMs: Number,
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.CodeSubmission || mongoose.model('CodeSubmission', submissionSchema);
