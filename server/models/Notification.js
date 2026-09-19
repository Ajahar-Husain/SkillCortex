import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    toEmail: String,
    type: { type: String, required: true, index: true },
    subject: String,
    body: String,
    data: mongoose.Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
