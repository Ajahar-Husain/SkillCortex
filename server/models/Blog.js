import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, index: true },
    excerpt: String,
    content: String,
    skills: [String],
    readMin: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);
