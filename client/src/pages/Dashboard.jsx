import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, MessagesSquare, Target, Coins, Flame, Award, Sparkles,
  ArrowRight, Briefcase, BrainCircuit, TrendingUp, LineChart, CalendarDays,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CountUp, Reveal, Stagger, StaggerItem } from '../components/ui/motion';

/* ------------------------------------------------------------------ */
/* Stat card — glass tile with an animated count-up number.            */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, suffix = '', accent = 'from-cortex-500 to-plasma' }) {
  return (
    <StaggerItem className="h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass rounded-2xl p-5 h-full relative overflow-hidden group"
      >
        {/* corner glow on hover */}
        <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg shadow-indigo-600/25 mb-4`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="font-display text-3xl font-bold tracking-tight">
          <CountUp value={value} />
          <span className="text-lg text-slate-400 ml-0.5">{suffix}</span>
        </p>
        <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">{label}</p>
      </motion.div>
    </StaggerItem>
  );
}

/* ------------------------------------------------------------------ */
/* Animated score bar — grows to its score once mounted.               */
/* ------------------------------------------------------------------ */
function ScoreBar({ score, index }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150 + index * 90);
    return () => clearTimeout(t);
  }, [index]);

  const color = score >= 80 ? 'from-emerald-400 to-neon' : score >= 60 ? 'from-cortex-400 to-cortex-500' : 'from-amber-400 to-orange-500';
  return (
    <div className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5" title={`${score}/100`}>
      <span className="text-[11px] font-semibold text-slate-400">{score}</span>
      <div className="w-full h-28 rounded-lg bg-slate-800/60 relative overflow-hidden">
        <motion.div
          initial={{ height: '0%' }}
          animate={{ height: show ? `${Math.max(score, 4)}%` : '0%' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute bottom-0 inset-x-0 rounded-lg bg-gradient-to-t ${color}`}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const { user } = useAuth();

  const load = () => {
    setFailed(false);
    api.get('/api/analytics/me')
      .then((r) => setData(r.data))
      .catch(() => setFailed(true));
  };
  useEffect(load, []);


  /* ---------------- Loading skeleton ---------------- */
  if (!data && !failed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-14 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-slate-800/70 mb-3" />
        <div className="h-4 w-40 rounded bg-slate-800/50 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 h-36" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="glass rounded-3xl p-6 h-72" />
          <div className="glass rounded-3xl p-6 h-72" />
        </div>
      </div>
    );
  }

  /* ---------------- Error state ---------------- */
  if (failed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="glass rounded-3xl p-12 inline-block">
          <p className="text-slate-400 mb-4">Couldn't load your dashboard.</p>
          <button onClick={load} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cortex-500 to-plasma font-medium">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: FileText, label: 'Applications', value: data.applications || 0, accent: 'from-cortex-500 to-plasma' },
    { icon: MessagesSquare, label: 'Interviews', value: data.interviews || 0, accent: 'from-plasma to-fuchsia-500' },
    { icon: Target, label: 'Avg Score', value: data.avgScore || 0, suffix: '/100', accent: 'from-neon to-cortex-400' },
    { icon: TrendingUp, label: 'Points', value: data.points || 0, accent: 'from-emerald-400 to-neon' },
    { icon: Coins, label: 'Skill Coins', value: data.coins || 0, accent: 'from-amber-400 to-orange-500' },
    { icon: Flame, label: 'Day Streak', value: data.streak || 0, accent: 'from-rose-500 to-orange-500' },
  ];

  const history = (data.history || []).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      {/* ================= HEADER ================= */}
      <Reveal y={16}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5">
          <Sparkles className="h-4 w-4 text-neon" />
          <span className="text-sm font-medium text-slate-300">Your command center</span>
        </div>
      </Reveal>
      <Reveal y={16} delay={0.08}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'candidate'}</span>
            </h1>
            <p className="text-slate-400 mt-2">Every number here counts itself up — just like your skills.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/interview" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cortex-500 to-plasma font-semibold text-sm shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 hover:scale-[1.03] transition-transform">
              Start Interview <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/jobs" className="px-5 py-2.5 rounded-xl glass font-medium text-sm text-slate-200 inline-flex items-center gap-2 hover:border-indigo-400/40 transition-colors">
              <Briefcase className="w-4 h-4" /> Browse Jobs
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ================= COUNT-UP STATS ================= */}
      <Stagger className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </Stagger>

      {/* ================= SCORE HISTORY + BADGES ================= */}
      <div className="grid md:grid-cols-5 gap-6 mt-8">
        {/* Score history */}
        <Reveal delay={0.1} className="md:col-span-3">
          <div className="glass-strong rounded-3xl p-6 md:p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <LineChart className="w-5 h-5 text-neon" /> Score History
              </h2>
              {history.length > 0 && (
                <span className="text-xs text-slate-500 uppercase tracking-wider inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> last {history.length}
                </span>
              )}
            </div>

            {history.length ? (
              <>
                <div className="flex items-end gap-3 md:gap-4 h-44">
                  {history.map((h, i) => (
                    <ScoreBar key={i} score={Math.round(h.score || 0)} index={i} />
                  ))}
                </div>
                <div className="mt-4 space-y-1">
                  {history.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-white/5">
                      <span className="text-slate-300 truncate mr-4">{h.job || 'Interview'}</span>
                      <span className={`font-bold shrink-0 ${(h.score || 0) >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {Math.round(h.score || 0)}/100
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <BrainCircuit className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No interviews yet — your first score will land here.</p>
                <Link to="/interview" className="text-cortex-400 text-sm mt-2 inline-flex items-center gap-1">
                  Take one now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </Reveal>

        {/* Badges */}
        <Reveal delay={0.18} className="md:col-span-2">
          <div className="glass-strong rounded-3xl p-6 md:p-8 h-full flex flex-col">
            <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-amber-400" /> Badges
              <span className="text-xs font-sans font-semibold text-slate-500 bg-slate-800/70 px-2 py-0.5 rounded-full">
                <CountUp value={data.badges?.length || 0} />
              </span>
            </h2>
            {(data.badges || []).length ? (
              <Stagger className="flex flex-wrap gap-2 content-start">
                {(data.badges || []).map((b, i) => (
                  <StaggerItem key={i}>
                    <motion.span
                      whileHover={{ scale: 1.06, rotate: -1.5 }}
                      className="inline-block px-3.5 py-1.5 glass rounded-full text-xs font-medium text-amber-300 border-amber-500/25"
                    >
                      {b.name} <span className="text-amber-500/70">• {b.level}</span>
                    </motion.span>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <Award className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">Earn badges via quizzes &amp; interviews.</p>
              </div>
            )}
            <Link to="/skills" className="text-sm text-cortex-400 mt-6 inline-flex items-center gap-1.5 group">
              View all skills
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <Reveal delay={0.12}>
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { to: '/skills', icon: Award, title: 'Skill Tree', desc: 'Level up tracked skills' },
            { to: '/assistant', icon: BrainCircuit, title: 'AI Assistant', desc: 'Ask AJ anything career' },
            { to: '/applications', icon: FileText, title: 'My Applications', desc: 'Track every pipeline' },
          ].map(({ to, icon: Icon, title, desc }) => (
            <motion.div key={to} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <Link to={to} className="glass rounded-2xl p-5 flex items-center gap-4 h-full hover:border-indigo-400/40 transition-colors">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-cortex-500/20 to-plasma/20 border border-indigo-400/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cortex-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-slate-500 truncate">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-600 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
