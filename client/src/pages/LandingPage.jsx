import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Building, Briefcase, MapPin, IndianRupee, Users, Zap, Globe, Sparkles, ArrowRight, Mic, Code2, ShieldCheck, LineChart, CheckCircle2, XCircle, FileText, Target, Cpu, Wifi, Braces, Lock } from 'lucide-react';
import api from '../services/api';
import { CountUp, TiltCard, Reveal, Stagger, StaggerItem } from '../components/ui/motion';

export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentJobs, setRecentJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/api/jobs');
                // PRD §47 — GET /api/jobs returns a paginated envelope { jobs, total, page, pages }.
                const list = res.data?.jobs || (Array.isArray(res.data) ? res.data : []);
                setRecentJobs(list.slice(0, 3));
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate('/jobs');
    };

    const words1 = ['Hire', 'the', 'mind,'];
    const words2 = ['not', 'just', 'the', 'resume.'];

    return (
        <div className="flex flex-col items-center overflow-hidden">
            {/* ================= HERO ================= */}
            <section className="relative w-full min-h-[92vh] flex items-center justify-center px-6">
                <div className="relative z-10 text-center max-w-6xl mx-auto pt-16 pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                    >
                        <Sparkles className="h-4 w-4 text-neon" />
                        <span className="text-sm font-medium text-slate-300">AI Interviewer · Coding Assessment · ATS — one loop</span>
                    </motion.div>

                    {/* Staggered 3D headline */}
                    <h1 className="font-display text-5xl md:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-8">
                        <span className="block">
                            {words1.map((w, i) => (
                                <motion.span key={i} className="inline-block mr-4"
                                    initial={{ opacity: 0, y: 40, rotateX: -50 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    transition={{ delay: 0.15 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                                    {w}
                                </motion.span>
                            ))}
                        </span>
                        <span className="block gradient-text">
                            {words2.map((w, i) => (
                                <motion.span key={i} className="inline-block mr-4"
                                    initial={{ opacity: 0, y: 40, rotateX: -50 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    transition={{ delay: 0.5 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                                    {w}
                                </motion.span>
                            ))}
                        </span>
                    </h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
                        className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Apply once, prove your skills to <span className="text-slate-200 font-medium">AJ — the AI Interviewer</span> — solve a live coding challenge, and get scored on real evidence. Qualified candidates land straight on the recruiter's desk.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/jobs')}
                            className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cortex-500 to-plasma text-white font-semibold shadow-xl shadow-indigo-600/30 ring-glow flex items-center justify-center gap-2">
                            Explore Jobs
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass text-slate-100 font-semibold hover:border-indigo-400/40 transition-colors">
                            Start Free — Candidate
                        </motion.button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}
                        className="mt-16 grid grid-cols-3 max-w-xl mx-auto glass rounded-3xl py-6 px-2 divide-x divide-slate-700/50">
                        {[
                            { v: recentJobs.length > 0 ? recentJobs.length * 8 + 17 : 25, s: '+', l: 'Open Roles' },
                            { v: 92, s: '%', l: 'HR Time Saved' },
                            { v: 74, s: 'k+', l: 'AJ Questions Asked' },
                        ].map((s) => (
                            <div key={s.l} className="px-2">
                                <p className="font-display text-2xl md:text-3xl font-bold text-white">
                                    <CountUp value={s.v} />{s.s}
                                </p>
                                <p className="text-[11px] md:text-xs text-slate-500 uppercase tracking-wider mt-1">{s.l}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500">
                    <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
                        <div className="w-1 h-2 rounded-full bg-slate-400" />
                    </div>
                </motion.div>
            </section>

            {/* ================= SKILLS MARQUEE ================= */}
            <section className="w-full py-8 border-y border-slate-800/60 bg-[#070b16]/80 relative overflow-hidden">
                <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#050810] to-transparent z-10" />
                <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#050810] to-transparent z-10" />
                <div className="flex w-max animate-marquee gap-10" aria-hidden="true">
                    {[...Array(2)].flatMap((_, dup) =>
                        ['React', 'Node.js', 'System Design', 'TypeScript', 'MongoDB', 'Python', 'AWS', 'GraphQL', 'Docker', 'DSA', 'Microservices', 'Kubernetes'].map((s, i) => (
                            <span key={dup + '-' + i} className="flex items-center gap-2 text-slate-500 font-display text-sm tracking-widest uppercase whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-cortex-500/60" />
                                {s}
                            </span>
                        ))
                    )}
                </div>
            </section>

            {/* ================= HOW IT WORKS ================= */}
            <section className="w-full py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal className="text-center mb-16">
                        <p className="text-cortex-400 font-semibold text-sm uppercase tracking-[0.25em] mb-3">The Loop</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">From application to <span className="gradient-text">shortlist</span> — automatically</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Every stage is scored, evidenced and delivered to the recruiter without a single manual screening call.</p>
                    </Reveal>

                    <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Mic, step: '01', title: 'Voice Interview', desc: 'AJ conducts a personalized, adaptive video/voice interview based on the job and your resume.' },
                            { icon: Code2, step: '02', title: 'Live Coding', desc: 'A real editor with hidden test cases. Code runs against the grader instantly.' },
                            { icon: ShieldCheck, step: '03', title: 'Integrity Analysis', desc: 'Tab switches, fullscreen exits and anomalies are tracked into a trust score.' },
                            { icon: LineChart, step: '04', title: 'Evidence Report', desc: 'Dimension-level scores with covered/missed concepts — the why behind every number.' },
                        ].map((f) => (
                            <StaggerItem key={f.step} className="relative">
                                <div className="h-full glass card-hover rounded-3xl p-7 relative overflow-hidden">
                                    <span className="absolute -top-3 right-4 font-display text-7xl font-bold text-slate-700/30 select-none">{f.step}</span>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cortex-500/25 to-plasma/25 border border-indigo-400/20 text-cortex-400 flex items-center justify-center mb-5">
                                        <f.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* ================= EVIDENCE LAYER (bridges The Loop -> Built different) ================= */}
            <section className="w-full py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal className="text-center mb-14">
                        <p className="text-cortex-400 font-semibold text-sm uppercase tracking-[0.25em] mb-3">The Evidence Layer</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Automated, yet <span className="gradient-text">fully accountable</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">The loop runs itself — but nothing it decides is a black box. Every score arrives with the artifact that produced it, so a recruiter can open it, audit it and defend the shortlist.</p>
                    </Reveal>

                    <Reveal className="mb-14">
                        <div className="glass rounded-3xl px-6 py-7 md:px-8">
                            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
                                {[
                                    { icon: FileText, label: 'Apply once' },
                                    { icon: Mic, label: 'AJ Interview' },
                                    { icon: Code2, label: 'Live Coding' },
                                    { icon: ShieldCheck, label: 'Integrity Check' },
                                    { icon: Target, label: 'Ranked Shortlist' },
                                ].map((step, i, arr) => (
                                    <div key={step.label} className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-colors ${i === arr.length - 1 ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-slate-700/60 bg-white/[0.03]'}`}>
                                            <step.icon className={`h-4 w-4 ${i === arr.length - 1 ? 'text-cortex-400' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-medium ${i === arr.length - 1 ? 'text-slate-100' : 'text-slate-300'}`}>{step.label}</span>
                                        </div>
                                        {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-[11px] uppercase tracking-[0.2em] text-slate-500 mt-6">One continuous run — no recruiter handoffs, no scheduling emails, no first-round phone tag</p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Reveal>
                            <div className="glass rounded-3xl p-8 h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-2xl bg-slate-700/30 border border-slate-600/40 flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg font-semibold text-slate-200">Traditional screening</h3>
                                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">What it costs you</p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        'Resume keywords decide who gets a call',
                                        'Unpaid 30-minute phone screens for every applicant',
                                        'Gut-feel shortlists with no written reason',
                                        'No record of what was actually asked or answered',
                                        'Engineering hours burned on first-round filtering',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                                            <XCircle className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>

                        <Reveal delay={0.12}>
                            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-cortex-500/60 via-indigo-500/40 to-plasma/60 h-full">
                                <div className="rounded-3xl bg-[#0a0f1e] p-8 h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cortex-500 to-plasma flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                            <CheckCircle2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-lg font-semibold text-white">The SkillCortex loop</h3>
                                            <p className="text-[11px] text-cortex-400 uppercase tracking-wider">What you actually receive</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-3">
                                        {[
                                            'AJ interviews against the real job description and the resume',
                                            'Code runs against hidden test cases and is graded instantly',
                                            'Dimension-level scores listing covered and missed concepts',
                                            'Full transcript, integrity trust score and report attached',
                                            'A ranked shortlist with the why behind every number',
                                        ].map((item) => (
                                            <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal delay={0.1} className="mt-14">
                        <div className="glass rounded-3xl py-8 px-4 grid grid-cols-2 md:grid-cols-4 divide-y divide-slate-700/40 md:divide-y-0 md:divide-x">
                            {[
                                { v: 0, s: '', l: 'Manual screening calls' },
                                { v: 4, s: '', l: 'Evidence artifacts per candidate' },
                                { v: 5, s: '', l: 'Scored dimensions per report' },
                                { v: 100, s: '%', l: 'Decisions backed by evidence' },
                            ].map((s) => (
                                <div key={s.l} className="px-4 py-3 text-center">
                                    <p className="font-display text-2xl md:text-3xl font-bold text-white"><CountUp value={s.v} />{s.s}</p>
                                    <p className="text-[11px] md:text-xs text-slate-500 uppercase tracking-wider mt-1">{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </Reveal>

                </div>
            </section>

            {/* ================= FEATURES (3D tilt) ================= */}
            <section className="w-full py-16 relative" style={{ perspective: '1200px' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal className="text-center mb-14">
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Built different, <span className="gradient-text">on purpose</span></h2>
                        <p className="text-slate-400">Next-generation assessment infrastructure — not another job board.</p>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Real-time P2P', desc: 'Zero-latency video communication over WebRTC data channels directly between peers.', tag: 'WebRTC' },
                            { icon: Users, title: 'Adaptive AI Interviewer', desc: 'Questions get harder or easier based on your running score — one lucky answer swings nothing.', tag: 'Gemini AI' },
                            { icon: Globe, title: 'Recruiter-Ready ATS', desc: 'Ranked candidates with transcripts, coding results and integrity trails attached automatically.', tag: 'ATS' },
                        ].map((feature, idx) => (
                            <Reveal key={idx} delay={idx * 0.12}>
                                <TiltCard>
                                    <div className="glass card-hover rounded-3xl p-8 h-full relative">
                                        <div className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/15 text-cortex-400 border border-indigo-400/20">{feature.tag}</div>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cortex-500 to-plasma p-[1px] mb-6">
                                            <div className="w-full h-full rounded-2xl bg-[#0a0f1e] flex items-center justify-center text-cortex-400">
                                                <feature.icon className="h-7 w-7" />
                                            </div>
                                        </div>
                                        <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                                        <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                                    </div>
                                </TiltCard>
                            </Reveal>
                        ))}
                    </div>
                    <Reveal delay={0.15} className="mt-10">
                        <div className="glass rounded-3xl px-6 py-7 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: Cpu, tag: 'Gemini 2.5 Flash', desc: 'Adaptive question generation and transcript-level scoring' },
                                { icon: Wifi, tag: 'WebRTC P2P', desc: 'Sub-second video signalling with real-time socket events' },
                                { icon: Braces, tag: 'Sandboxed Grader', desc: 'Hidden test cases executed against submitted code' },
                                { icon: Lock, tag: 'JWT + OAuth', desc: 'Hashed credentials, scoped tokens and guarded routes' },
                            ].map((row) => (
                                <div key={row.tag} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-slate-700/60 flex items-center justify-center text-cortex-400 shrink-0">
                                        <row.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-display text-sm font-semibold text-slate-100">{row.tag}</p>
                                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{row.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ================= SEARCH BAND ================= */}
            <section className="w-full px-6">
                <Reveal className="max-w-4xl mx-auto">
                    <form onSubmit={handleSearch} className="glass-strong rounded-3xl p-2 flex items-center gap-2 ring-glow">
                        <Search className="w-5 h-5 text-slate-500 ml-4 shrink-0" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search roles — React, Node.js, Data Engineer…"
                            className="flex-1 bg-transparent py-4 px-2 text-slate-200 placeholder-slate-500 focus:outline-none"
                        />
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} type="submit"
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cortex-500 to-plasma text-white font-semibold shadow-lg shadow-indigo-600/30">
                            Search
                        </motion.button>
                    </form>
                </Reveal>
            </section>

            {/* ================= FEATURED JOBS ================= */}
            <section className="w-full py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <Reveal>
                            <p className="text-cortex-400 font-semibold text-sm uppercase tracking-[0.25em] mb-3">Live Board</p>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured Opportunities</h2>
                            <p className="text-slate-400">Discover top roles and interview with AJ the moment you apply.</p>
                        </Reveal>
                        <Reveal delay={0.1} className="hidden sm:block">
                            <button onClick={() => navigate('/jobs')} className="group flex items-center gap-2 text-cortex-400 hover:text-cortex-50 font-medium">
                                View All Jobs
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Reveal>
                    </div>

                    {loadingJobs ? (
                        <div className="flex justify-center p-16">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500/20 border-t-cortex-400" />
                                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-lg" />
                            </div>
                        </div>
                    ) : recentJobs.length > 0 ? (
                        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentJobs.map((job) => (
                                <StaggerItem key={job._id}>
                                    <motion.div
                                        whileHover={{ y: -8 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                        onClick={() => navigate('/jobs')}
                                        className="glass card-hover rounded-3xl p-6 flex flex-col h-full cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cortex-500 to-plasma flex items-center justify-center font-display text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
                                                {job.company?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">Hiring</span>
                                        </div>
                                        <h3 className="font-display text-xl font-bold mb-1 group-hover:text-cortex-400 transition-colors">{job.title}</h3>
                                        <div className="flex items-center text-slate-400 text-sm font-medium mb-4">
                                            <Building className="w-4 h-4 mr-1.5" /> {job.company}
                                        </div>
                                        <div className="mt-auto space-y-2">
                                            {job.location && (
                                                <div className="flex items-center text-slate-400 text-sm">
                                                    <MapPin className="w-4 h-4 mr-2 text-slate-500" /> {job.location}
                                                </div>
                                            )}
                                            {job.salary && (
                                                <div className="flex items-center text-slate-400 text-sm">
                                                    <IndianRupee className="w-4 h-4 mr-2 text-emerald-500" /> {job.salary}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    ) : (
                        <div className="text-center p-16 glass rounded-3xl">
                            <p className="text-slate-400">No featured jobs yet — check back soon.</p>
                        </div>
                    )}

                    <div className="mt-10 text-center sm:hidden">
                        <button onClick={() => navigate('/jobs')} className="text-cortex-400 font-medium">View All Jobs &rarr;</button>
                    </div>
                </div>
            </section>

            {/* ================= CLOSER ================= */}
            <section className="w-full px-6 pb-24">
                <Reveal className="max-w-5xl mx-auto">
                    <div className="relative rounded-[2rem] overflow-hidden ring-glow">
                        <div className="absolute inset-0 bg-gradient-to-br from-cortex-500/20 via-transparent to-plasma/20" />
                        <div className="relative glass-strong rounded-[2rem] px-8 py-16 text-center">
                            <BrainIcon />
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Your next interview is <span className="gradient-text">already waiting</span></h2>
                            <p className="text-slate-400 max-w-xl mx-auto mb-8">Create an account, drop your resume, and let AJ put your real skills on the record.</p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={() => navigate('/register')}
                                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cortex-500 to-plasma text-white font-semibold shadow-xl shadow-indigo-600/30 ring-glow inline-flex items-center gap-2">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </Reveal>
            </section>
        </div>
    );
}

function BrainIcon() {
    return (
        <motion.div animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cortex-500 to-plasma flex items-center justify-center shadow-xl shadow-indigo-600/40">
            <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
    );
}
