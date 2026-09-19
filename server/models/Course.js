import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    description: String,
    level: String,
    skills: [String],
    priceCoins: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    modules: [{ title: String, notes: String, videoUrl: String, durationMin: Number }],
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
