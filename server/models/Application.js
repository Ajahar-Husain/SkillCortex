import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    status: {
      type: String,
      enum: ['APPLIED', 'ASSESSMENT_PENDING', 'ASSESSMENT_STARTED', 'ASSESSMENT_COMPLETED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'HIRED'],
      default: 'APPLIED',
      index: true,
    },
    matchScore: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
