import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    requirements: [String],
    location: String,
    salary: String,
    hrRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
