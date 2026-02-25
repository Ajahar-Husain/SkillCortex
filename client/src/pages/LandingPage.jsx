import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Building, Briefcase, MapPin, IndianRupee, Clock, Users, Zap, Globe, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentJobs, setRecentJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('/api/jobs');
                // get top 3 recent open jobs
                const openJobs = res.data.filter(j => j.status === 'open');
                setRecentJobs(openJobs.slice(0, 3));
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
        // Just navigate to jobs board, optionally could pass query via state or URL
        navigate('/jobs');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    className="relative z-10 text-center max-w-5xl px-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={childVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-8">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">Empowering Peer-to-Peer Learning</span>
                    </motion.div>

                    <motion.h1 variants={childVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Connecting Minds.<br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Elevating Skills.
                        </span>
                    </motion.h1>

                    <motion.p variants={childVariants} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        SkillCortex provides seamless access to top roles. Match with companies instantly and prove your skills to our AI Interviewer.
                    </motion.p>

                    <motion.div variants={childVariants} className="max-w-xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search for fully remote, backend, frontend..."
                                    className="w-full pl-10 pr-4 py-3 bg-transparent border-none text-white focus:outline-none placeholder-slate-500 rounded-md"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 shrink-0"
                            >
                                Find Jobs
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Showcase */}
            <section className="w-full py-24 bg-slate-950/50 border-t border-slate-900 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillCortex?</h2>
                        <p className="text-slate-400">Next-generation functionality powered by the MERN stack and WebRTC.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Real-time P2P', desc: 'Zero latency video communication using modern WebRTC data channels directly between peers.' },
                            { icon: Users, title: 'Collaborative Spaces', desc: 'Secure rooms crafted dynamically with Framer Motion animations for complete interactive immersion.' },
                            { icon: Globe, title: 'Global Reach', desc: 'Connect anywhere in the world effortlessly. MongoDB handles state, Express routes connections securely.' }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:bg-slate-800/80 transition-all hover:-translate-y-2 group"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <div className="w-14 h-14 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Jobs Section */}
            <section className="w-full py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Opportunities</h2>
                            <p className="text-slate-400">Discover top roles and quick apply with our AI Interviewer.</p>
                        </div>
                        <button onClick={() => navigate('/jobs')} className="text-blue-400 hover:text-blue-300 font-medium hidden sm:block">
                            View All Jobs &rarr;
                        </button>
                    </div>

                    {loadingJobs ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : recentJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentJobs.map((job) => (
                                <motion.div
                                    key={job._id}
                                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/80 transition-all hover:-translate-y-1 group flex flex-col h-full cursor-pointer shadow-lg"
                                    onClick={() => navigate('/jobs')}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                                            {job.company.charAt(0)}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{job.title}</h3>
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
                                                <IndianRupee className="w-4 h-4 mr-2 text-green-500" /> {job.salary}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <p className="text-slate-400">No featured jobs at the moment.</p>
                        </div>
                    )}

                    <div className="mt-8 text-center sm:hidden">
                        <button onClick={() => navigate('/jobs')} className="text-blue-400 hover:text-blue-300 font-medium">
                            View All Jobs &rarr;
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
