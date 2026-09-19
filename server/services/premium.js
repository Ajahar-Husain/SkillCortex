import Subscription from '../models/Subscription.js';

// PRD §53 — Premium Features catalogue. The plan matrix is the single source of
// truth shared by the pricing page, the checkout route and the entitlement check.
export const PREMIUM_PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    priceInr: 0,
    interval: 'month',
    tagline: 'Everything you need to start applying.',
    features: [
      'Unlimited job applications',
      'One AI interview per application',
      'Skill points, coins and badges',
      'Access to free courses and blogs',
    ],
    entitlements: { unlimitedAiInterviews: false, priorityHrVisibility: false, downloadableReports: false, premiumCourses: false, resumeReview: false, mockInterviewCredits: 1 },
  },
  {
    id: 'PRO',
    name: 'Pro',
    priceInr: 499,
    interval: 'month',
    tagline: 'For candidates actively interviewing.',
    badge: 'Most popular',
    features: [
      'Everything in Free',
      '5 mock AI interviews every month',
      'AI resume review with rewrite suggestions',
      'Priority visibility to recruiters',
    ],
    entitlements: { unlimitedAiInterviews: false, priorityHrVisibility: true, downloadableReports: true, premiumCourses: true, resumeReview: true, mockInterviewCredits: 5 },
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    priceInr: 999,
    interval: 'month',
    tagline: 'Maximum interview practice and exposure.',
    features: [
      'Everything in Pro',
      'Unlimited AI interviews and re-attempts',
      'Downloadable PDF/interview reports',
      'All premium courses included',
      'Top placement in recruiter shortlists',
    ],
    entitlements: { unlimitedAiInterviews: true, priorityHrVisibility: true, downloadableReports: true, premiumCourses: true, resumeReview: true, mockInterviewCredits: 999 },
  },
];

export const planById = (id) => PREMIUM_PLANS.find((p) => p.id === id) || null;

const DEFAULT_FEATURES = { unlimitedAiInterviews: false, priorityHrVisibility: false, downloadableReports: false, premiumCourses: false, resumeReview: false, mockInterviewCredits: 0 };

// Returns the effective subscription for a user, always shaped like a
// Subscription document so callers never need to null-check.
export async function getSubscription(userId) {
  let sub = await Subscription.findOne({ userId });
  if (!sub) sub = await Subscription.create({ userId, plan: 'FREE', status: 'INACTIVE', features: DEFAULT_FEATURES });
  return sub;
}

// PRD §53 — entitlement gate used by premium-only routes.
export async function hasEntitlement(userId, key) {
  const sub = await getSubscription(userId);
  if (!sub.isActive()) return false;
  return !!sub.features?.[key];
}

// Applies a successful payment: activates the plan, extends the window and
// records the receipt. Used by both the Stripe webhook and the dev confirm flow.
export async function activatePlan({ userId, planId, interval = 'month', provider = 'stripe', amount = 0, currency = 'INR', stripeSessionId, stripePaymentIntentId, stripeCustomerId, stripeSubscriptionId }) {
  const plan = planById(planId);
  if (!plan) throw new Error('Unknown plan: ' + planId);

  let sub = await getSubscription(userId);
  const now = Date.now();
  const base = sub.expiresAt && new Date(sub.expiresAt).getTime() > now ? new Date(sub.expiresAt).getTime() : now;
  const extendMs = interval === 'year' ? 365 * 24 * 60 * 60 * 1000 : interval === 'lifetime' ? 100 * 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

  sub.plan = plan.id;
  sub.interval = interval;
  sub.status = 'ACTIVE';
  sub.features = { ...DEFAULT_FEATURES, ...plan.entitlements };
  sub.startedAt = sub.startedAt || new Date();
  sub.expiresAt = new Date(base + extendMs);
  sub.canceledAt = undefined;
  if (stripeCustomerId) sub.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) sub.stripeSubscriptionId = stripeSubscriptionId;
  sub.payments.push({
    provider, amount, currency, plan: plan.id, interval,
    status: 'PAID', stripeSessionId, stripePaymentIntentId, at: new Date(),
  });
  await sub.save();
  return sub;
}