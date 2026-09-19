import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import interviewRoutes from './routes/interviews.js';
import uploadRoutes from './routes/upload.js';
import quizRoutes from './routes/quiz.js';
import applicationRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';
import assessmentRoutes from './routes/assessments.js';
import analyticsRoutes from './routes/analytics.js';
import platformRoutes from './routes/platform.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());

// Middleware
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Request log with session id passthrough
app.use((req, _res, next) => {
  req.sessionId = req.headers['x-session-id'] || req.query.sessionId;
  next();
});

// Routes (PRD §47)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resumes', uploadRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', platformRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io for WebRTC signaling + interview realtime events (PRD §18)
const io = new Server(server, {
  cors: { origin: CLIENT_URLS.concat(['http://localhost:5173', 'http://localhost:5177']), methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  socket.on('call-user', (data) => {
    io.to(data.userToCall).emit('receive-call', { signal: data.signalData, from: data.from, name: data.name });
  });

  socket.on('answer-call', (data) => {
    io.to(data.to).emit('call-accepted', data.signal);
  });

  // Interview session realtime: join session room, broadcast questions/timer/integrity
  socket.on('interview:join', ({ sessionId }) => {
    if (sessionId) socket.join('interview:' + sessionId);
  });
  socket.on('interview:question', ({ sessionId, question }) => {
    socket.to('interview:' + sessionId).emit('interview:question', { question, at: new Date() });
  });
  socket.on('interview:integrity', ({ sessionId, event }) => {
    socket.to('interview:' + sessionId).emit('interview:integrity', { event, at: new Date() });
  });
  socket.on('interview:status', ({ sessionId, status }) => {
    io.to('interview:' + sessionId).emit('interview:status', { status, at: new Date() });
  });
});

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SkillCortex API is running' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
