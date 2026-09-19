import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    token: { type: String, unique: true, index: true },
    userAgent: String,
    ip: String,
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);
