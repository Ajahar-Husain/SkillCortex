import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    fileName: String,
    fileUrl: String,
    rawText: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, default: '' },
    education: { type: String, default: '' },
    projects: { type: [String], default: [] },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
