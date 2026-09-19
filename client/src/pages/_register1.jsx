import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, GraduationCap, AlertCircle, BrainCircuit, Building, ArrowRight } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate',
        company: '',
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
            const extra = formData.role === 'hr' ? { company: formData.company } : {};
            await register(formData.name, formData.email, formData.password, formData.role, extra);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-4xl grid lg:grid-cols-2 rounded-[2rem] overflow-hidden glass-strong shadow-2xl relative"
            >
                {/* -------- Brand panel (desktop) -------- */}
                <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-plasma/15 via-transparent to-cortex-500/15">
                    <div className="aurora w-64 h-64 bg-plasma/20 -top-16 -right-16 animate-pulse-glow" />
                    <div className="aurora w-52 h-52 bg-cortex-500/20 bottom-10 -left-16 animate-float-slow" />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2.5 group w-fit">
                            <BrainCircuit className="h-9 w-9 text-cortex-400" />
                            <span className="font-display font-bold text-2xl gradient-text">SkillCortex</span>
                        </Link>
                        <h2 className="font-display text-3xl font-bold mt-12 leading-snug">
                            Join the <span className="gradient-text">skill-first</span><br />hiring ecosystem.
                        </h2>
                        <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-xs">
                            Candidates prove themselves in real assessments. Recruiters get ranked, evidenced shortlists.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4 mt-10">
                        {['Email + mobile OTP verification', 'Skill points, coins & badges', 'Personalized AI interview per job'].map((text, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                                className="flex items-center gap-3 text-sm text-slate-300"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cortex-400 to-plasma shrink-0" />
                                {text}
                            </motion.div>
                        ))}
                    </div>
                </div>
