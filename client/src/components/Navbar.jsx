import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, LogOut, User, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group">
                        <BrainCircuit className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-indigo-400 transition-all">
                            SkillCortex
                        </span>
                    </Link>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-6">
                            <Link to="/" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                            <Link to="/jobs" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Jobs</Link>
                            <Link to="/premium" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-bold text-yellow-500 transition-colors flex items-center gap-1">
                                <Crown className="w-4 h-4" /> Premium
                            </Link>

                            {user ? (
                                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                                    <Link to="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span>{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                                    <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                                    <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-blue-500/30">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
