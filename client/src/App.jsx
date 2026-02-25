import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import VideoRoom from './pages/VideoRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import InterviewSession from './pages/InterviewSession';
import QuizInterview from './pages/QuizInterview';
import PremiumRewards from './pages/PremiumRewards';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/premium" element={<PremiumRewards />} />
              <Route path="/interview" element={<InterviewSession />} />
              <Route path="/quiz" element={<QuizInterview />} />
              <Route path="/room/:roomId" element={<VideoRoom />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
