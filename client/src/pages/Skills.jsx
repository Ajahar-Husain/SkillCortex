import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ALL = ['React Developer', 'Node.js Developer', 'Java Backend', 'MongoDB', 'AWS Cloud', 'Full Stack', 'Problem Solver', 'AI Fundamentals'];

export default function Skills() {
  const { user } = useAuth();
  const earned = new Set((user?.badges || []).map((b) => b.name));
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Skill Badges</h1>
      <p className="text-slate-400 mt-1">Earn Bronze → Elite via interviews, quizzes, courses.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {ALL.map((b) => (
          <div key={b} className={`border rounded-2xl p-4 text-center ${earned.has(b) ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-slate-800 bg-slate-900'}`}>
            <p className="font-bold text-sm">{b}</p>
            <p className="text-xs mt-1 text-slate-400">{[...earned].find((x) => x.includes(b.split(' ')[0])) || 'Locked'}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-sm text-slate-300">Your badges: {(user?.badges || []).map((b) => `${b.name} (${b.level})`).join(', ') || 'None yet — try the Quiz!'}</div>
      <Link to="/quiz" className="inline-block mt-4 px-5 py-2 bg-indigo-600 rounded-xl text-sm font-bold">Take a Quiz</Link>
    </div>
  );
}
