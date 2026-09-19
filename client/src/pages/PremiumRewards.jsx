import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Code2, BookOpen, Trophy, Zap, Terminal, Coffee, Layers } from 'lucide-react';

export default function PremiumRewards() {
    const courses = [
        { title: 'Advanced C Programming', icon: Terminal, color: 'text-blue-500', bg: 'bg-blue-500/10', points: 1500, desc: 'Master memory management, pointers, and systems programming.' },
        { title: 'Java Spring Masterclass', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-500/10', points: 2000, desc: 'Build scalable enterprise backends with robust microservices.' },
        { title: 'Deep Dive JavaScript', icon: Code2, color: 'text-yellow-400', bg: 'bg-yellow-400/10', points: 1800, desc: 'Understand the event loop, closures, and modern ES6+ patterns.' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">

            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-800 p-10 mb-12">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-bold text-sm mb-6 border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
                            <Crown className="w-5 h-5" /> SkillCortex Premium
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Level Up Your Career.</h1>
                        <p className="text-purple-200 text-lg">
                            Redeem your skill points earned through peer interviews to unlock exclusive coding courses and advanced practice problems.
                        </p>
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur border border-purple-500/30 p-6 rounded-2xl text-center shadow-2xl">
                        <div className="text-slate-400 font-medium mb-2">Your Balance</div>
                        <div className="text-5xl font-black text-yellow-500 mb-2 font-mono flex items-center justify-center gap-2">
                            <Zap className="w-8 h-8" /> 0
                        </div>
                        <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">Skill Points</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Premium Courses */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                        <BookOpen className="text-purple-400" /> Exclusive Video Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-purple-500/50 transition-colors group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${course.bg} rounded-bl-full blur-2xl opacity-50 transition-opacity group-hover:opacity-100`} />
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-slate-800 border border-slate-700`}>
                                        <course.icon className={`w-6 h-6 ${course.color}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                                    <p className="text-sm text-slate-400 mb-6">{course.desc}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="font-bold text-yellow-500 flex items-center gap-1"><Zap className="w-4 h-4" /> {course.points} pts</span>
                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                            Unlock
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Practice Sessions */}
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                        <Trophy className="text-yellow-400" /> Daily Challenges
                    </h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                            <h3 className="font-bold text-white mb-1">Algorithmic Problem Solving</h3>
                            <p className="text-xs text-slate-400">Complete challenges to earn more points!</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                { lang: 'Java', diff: 'Hard', title: 'Binary Tree Inversion', points: 150 },
                                { lang: 'C', diff: 'Medium', title: 'Pointer Arithmetic Lab', points: 100 },
                                { lang: 'JavaScript', diff: 'Easy', title: 'Array Reduce Polfill', points: 50 },
                            ].map((chal, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                             ${chal.diff === 'Hard' ? 'bg-red-500/20 text-red-400' :
                                                    chal.diff === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-emerald-500/20 text-emerald-400'}`}>
                                                {chal.diff}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">{chal.lang}</span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{chal.title}</div>
                                    </div>
                                    <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded-md">
                                        +{chal.points}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
