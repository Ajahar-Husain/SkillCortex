import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  { input: mongoose.Schema.Types.Mixed, expected: mongoose.Schema.Types.Mixed, hidden: { type: Boolean, default: false }, description: String },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    language: { type: String, enum: ['javascript', 'python', 'java', 'cpp', 'sql'], default: 'javascript' },
    starterCode: { type: String, default: '' },
    testCases: { type: [testCaseSchema], default: [] },
    timeLimitSec: { type: Number, default: 1800 },
    difficulty: { type: String, default: 'Intermediate' },
  },
  { timestamps: true }
);

export default mongoose.models.CodingAssessment || mongoose.model('CodingAssessment', assessmentSchema);
