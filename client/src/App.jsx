import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import VideoRoom from './pages/VideoRoom';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import InterviewSession from './pages/InterviewSession';
import InterviewResult from './pages/InterviewResult';
import CodeAssessment from './pages/CodeAssessment';
import QuizInterview from './pages/QuizInterview';
import PremiumRewards from './pages/PremiumRewards';
import SkillAssistant from './pages/SkillAssistant';
import Skills from './pages/Skills';
import Courses from './pages/Courses';
import Blog from './pages/Blog';
import Applications from './pages/Applications';
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/HRDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500/20 border-t-indigo-400" />
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-md" />
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();

  // Every navigation starts from the top — routes should feel like pages.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050810] text-slate-50 relative">
      {/* Ambient backdrop shared by all pages — the SkillCortex signature */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="aurora w-[520px] h-[520px] bg-indigo-600/20 -top-40 -left-40 animate-pulse-glow" />
        <div className="aurora w-[460px] h-[460px] bg-cyan-500/10 top-1/3 -right-52 animate-float-slow" />
        <div className="aurora w-[380px] h-[380px] bg-fuchsia-600/10 bottom-0 left-1/4 animate-pulse-glow" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050810]/40 to-[#050810]" />
      </div>

      <Navbar />
      <main className="flex-grow relative z-10">
        {/* AnimatePresence replays the page transition on every route change */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/applications" element={<Protected><Applications /></Protected>} />
              <Route path="/premium" element={<PremiumRewards />} />
              <Route path="/interview" element={<Protected><InterviewSession /></Protected>} />
              <Route path="/interview/:id" element={<Protected><InterviewSession /></Protected>} />
              <Route path="/interview/:id/result" element={<Protected><InterviewResult /></Protected>} />
              <Route path="/assessment/:id/code" element={<Protected><CodeAssessment /></Protected>} />
              <Route path="/quiz" element={<QuizInterview />} />
              <Route path="/assistant" element={<SkillAssistant />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:slug" element={<Courses />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Blog />} />
              <Route path="/hr/dashboard" element={<Protected><HRDashboard /></Protected>} />
              <Route path="/hr/*" element={<Protected><HRDashboard /></Protected>} />
              <Route path="/room/:roomId" element={<VideoRoom />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
