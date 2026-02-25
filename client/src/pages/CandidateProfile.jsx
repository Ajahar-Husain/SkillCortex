import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Award, Brain, Target, Calendar, Edit3 } from 'lucide-react';

export default function CandidateProfile({ user }) {
    const navigate = useNavigate();
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sidebar / Left Column */}
                <div className="space-y-8">
                    {/* Main ID Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-indigo-500/20">
                                {user.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                            <p className="text-indigo-400 font-medium">{user.email}</p>

                            <div className="w-full mt-6 pt-6 border-t border-slate-800 flex justify-between items-center px-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{user.points || 0}</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider">Skill Points</div>
                                </div>
                                <div className="w-px h-10 bg-slate-800" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">0</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider">Interviews</div>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700">
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>
                    </motion.div>

                    {/* Quick Stats/Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
                    >
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Award className="text-yellow-500 w-5 h-5" /> Next Achievement
                        </h3>
                        <div className="bg-slate-800 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-200">First Technical Interview</span>
                                <span className="text-xs font-bold text-yellow-500">+500 pts</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 mb-2">
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full w-0"></div>
                            </div>
                            <p className="text-xs text-slate-400 text-right">0% Complete</p>
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Ongoing Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="text-indigo-400 w-6 h-6" /> Applications & Interviews
                            </h2>
                        </div>

                        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-700 bg-slate-800/50">
                            <Target className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-300 mb-2">No Active Applications</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-6">Explore the jobs portal to find roles and practice with the AJ Assistant.</p>
                            <button onClick={() => navigate('/jobs')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                                Browse Jobs
                            </button>
                        </div>
                    </motion.div>

                    {/* AJ Assistant Prompt */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-800 rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Brain className="w-64 h-64 -mb-16 -mr-16" />
                        </div>
                        <div className="relative z-10 w-full md:w-2/3">
                            <span className="px-3 py-1 bg-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm mb-4 inline-block border border-white/10">Premium Feature</span>
                            <h2 className="text-2xl font-bold text-white mb-3">Practice with AJ Assistant</h2>
                            <p className="text-indigo-200 mb-6 leading-relaxed">
                                Upload your resume and test your skills against our AI interviewer. It analyzes job descriptions to give you identical technical screening conditions.
                            </p>
                            <button onClick={() => navigate('/jobs')} className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2">
                                <Brain className="w-5 h-5" /> Start AI Mock Interview
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
