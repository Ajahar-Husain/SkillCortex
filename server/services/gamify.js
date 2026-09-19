import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function issueAuth(user) {
  const token = signToken(user);
  return { token, user: user.toSafeJSON ? user.toSafeJSON() : { id: user._id, name: user.name, email: user.email, role: user.role } };
}

export async function touchStreak(user) {
  const now = new Date();
  const last = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  if (!last || last.toDateString() !== now.toDateString()) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    user.streakDays = last && last.toDateString() === yesterday.toDateString() ? (user.streakDays || 0) + 1 : 1;
    user.lastActiveAt = now;
    await user.save();
  }
  return user.streakDays;
}

export async function awardPoints(userId, { points = 0, coins = 0, badge = null } = {}) {
  const user = await User.findById(userId);
  if (!user) return null;
  user.points = (user.points || 0) + points;
  user.skillCoins = (user.skillCoins || 0) + coins;
  if (badge && !user.badges.some((b) => b.name === badge.name && b.level === badge.level)) {
    user.badges.push({ ...badge, awardedAt: new Date() });
  }
  await user.save();
  return user;
}
