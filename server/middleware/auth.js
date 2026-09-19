import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1] || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // { userId, role, name? }
    next();
  } catch {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const optionalAuth = (req, _res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch { /* ignore */ }
  next();
};

export const isHR = (req, res, next) => {
  if (req.user?.role !== 'hr' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. HR only.' });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admin only.' });
  next();
};
