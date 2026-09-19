import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, BrainCircuit, Mic, Code2, LineChart, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-4xl grid lg:grid-cols-2 rounded-[2rem] overflow-hidden glass-strong shadow-2xl relative"
            >
                {/* -------- Brand panel (desktop) -------- */}
                <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-cortex-500/15 via-transparent to-plasma/15">
                    <div className="aurora w-64 h-64 bg-cortex-500/25 -top-16 -left-16 animate-pulse-glow" />
                    <div className="aurora w-52 h-52 bg-plasma/20 bottom-10 -right-16 animate-float-slow" />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2.5 group w-fit">
                            <BrainCircuit className="h-9 w-9 text-cortex-400" />
                            <span className="font-display font-bold text-2xl gradient-text">SkillCortex</span>
                        </Link>
                        <h2 className="font-display text-3xl font-bold mt-12 leading-snug">
                            Welcome back to your<br /><span className="gradient-text">cortex.</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-xs">
                            Pick up where you left off — interviews, coding challenges and your skill record are waiting.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4 mt-10">
                        {[
                            { icon: Mic, text: 'Adaptive voice interview with AJ' },
                            { icon: Code2, text: 'Live coding with hidden test cases' },
                            { icon: LineChart, text: 'Evidence-based scoring report' },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                                className="flex items-center gap-3 text-sm text-slate-300"
                            >
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center text-cortex-400 shrink-0">
                                    <f.icon className="w-4 h-4" />
                                </div>
                                {f.text}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* -------- Form panel -------- */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <BrainCircuit className="h-7 w-7 text-cortex-400" />
                        <span className="font-display font-bold text-xl gradient-text">SkillCortex</span>
                    </div>

                    <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-cortex-400 to-plasma bg-clip-text text-transparent">Sign in</h2>
                    <p className="text-slate-400 mt-2 mb-8 text-sm">Continue your SkillCortex journey</p>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
