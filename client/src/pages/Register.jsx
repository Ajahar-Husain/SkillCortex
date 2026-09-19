import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, GraduationCap, AlertCircle } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register(formData.name, formData.email, formData.password, formData.role);
            navigate('/'); // Redirect to dashboard or home
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem-20rem)] flex items-center justify-center p-6 relative overflow-hidden py-12">
            {/* Background glow effects */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Join SkillCortex</h2>
                    <p className="text-slate-400 mt-2">Create an account to unlock your potential</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'candidate' })}
                            className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'candidate' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                            <GraduationCap className="w-6 h-6" />
                            <span className="text-sm font-medium">Candidate</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'hr' })}
                            className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.role === 'hr' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                            <Briefcase className="w-6 h-6" />
                            <span className="text-sm font-medium">HR / Recruiter</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
                    >
                        {isLoading ? <span className="animate-pulse">Creating Account...</span> : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
