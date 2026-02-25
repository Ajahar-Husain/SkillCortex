import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    jobTitle: { type: String, required: true },
    hrId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateName: { type: String, required: true },
    aiScore: { type: Number, required: true },
    aiFeedback: { type: String, required: true },
    transcript: [{
        role: String,
        content: String
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CandidateReview', reviewSchema);
