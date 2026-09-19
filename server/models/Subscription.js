import mongoose from 'mongoose';

// PRD §52 — Payment System / §53 — Premium Features.
// One document per user, holding the active plan, its lifecycle window and the
// payment history so an admin can audit every premium upgrade (§58).
const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['stripe', 'skillcoins', 'manual'], default: 'stripe' },
    amount: { type: Number, default: 0 },          // minor units (paise/cents)
    currency: { type: String, default: 'INR' },
    plan: { type: String, default: 'FREE' },
    interval: { type: String, enum: ['month', 'year', 'lifetime'], default: 'month' },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    receiptUrl: String,
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'], default: 'FREE', index: true },
    interval: { type: String, enum: ['month', 'year', 'lifetime'], default: 'month' },
    status: { type: String, enum: ['INACTIVE', 'ACTIVE', 'PAST_DUE', 'CANCELED'], default: 'INACTIVE', index: true },
    // PRD §53 — feature entitlement flags the client reads to unlock gated UI.
    features: {
      unlimitedAiInterviews: { type: Boolean, default: false },
      priorityHrVisibility: { type: Boolean, default: false },
      downloadableReports: { type: Boolean, default: false },
      premiumCourses: { type: Boolean, default: false },
      resumeReview: { type: Boolean, default: false },
      mockInterviewCredits: { type: Number, default: 0 },
    },
    startedAt: Date,
    expiresAt: Date,
    canceledAt: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

subscriptionSchema.methods.isActive = function () {
  if (this.status !== 'ACTIVE') return false;
  if (!this.expiresAt) return true;
  return new Date(this.expiresAt).getTime() > Date.now();
};

export default mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);