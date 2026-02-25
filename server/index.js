import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import interviewRoutes from './routes/interview.js';
import uploadRoutes from './routes/upload.js';
import quizRoutes from './routes/quiz.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quiz', quizRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io for WebRTC signaling
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5177',
    methods: ['GET', 'POST']
  }
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
});

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SkillCortex API is running' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
