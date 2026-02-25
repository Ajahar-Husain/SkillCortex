import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, IndianRupee, Clock, Building, Briefcase, Search, Upload, X, FileUp } from 'lucide-react';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [resumeText, setResumeText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('/api/jobs');
                setJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleApply = (job) => {
        // Navigate to InterviewSession passing the job and resume as state
        navigate('/interview', { state: { job, resume: resumeText } });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileUpload = async (file) => {
        if (!file) return;
        setIsParsing(true);
        setResumeText('Parsing document, please wait...');
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await axios.post('/api/upload/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const extracted = res.data.text;
            if (!extracted || extracted.trim() === '') {
                setResumeText("Error: Selected document appears empty or could not be read. If it's an image-based PDF, please try copy-pasting your text instead.");
            } else {
                setResumeText(extracted);
            }
        } catch (err) {
            console.error("Failed to parse resume:", err);
            setResumeText("Failed to extract text from this document. Please check the format or paste your details manually.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-[80vh]">

            {/* Header & Search */}
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-white mb-4">Discover Opportunities</h1>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl">
                    Find your next role and prove your skills directly to employers via our automated AI Interviewer, AJ Assistant.
                </p>

                <div className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-lg"
                        placeholder="Search roles, companies, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredJobs.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-500 text-lg">
                            No open roles found matching your search.
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <motion.div
                                key={job._id}
                                variants={itemVariants}
                                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:bg-slate-800/80 transition-all hover:-translate-y-1 group flex flex-col h-full cursor-pointer shadow-lg hover:shadow-blue-900/20"
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                                        {job.company.charAt(0)}
                                    </div>
                                    <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-medium border border-slate-700">
                                        {job.status.toUpperCase()}
                                    </span>
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
                                    <div className="flex items-center text-slate-400 text-sm">
                                        <Clock className="w-4 h-4 mr-2 text-slate-500" /> Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                                    {job.requirements.slice(0, 3).map((req, i) => (
                                        <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                                            {req}
                                        </span>
                                    ))}
                                    {job.requirements.length > 3 && (
                                        <span className="text-xs bg-slate-800/50 text-slate-500 px-2 py-1 rounded">+{job.requirements.length - 3}</span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            )}

            {/* Modal for Job Details & Application */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => { setSelectedJob(null); setIsApplying(false); }}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10"
                        >
                            <button
                                onClick={() => { setSelectedJob(null); setIsApplying(false); }}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800 rounded-full p-2 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-md">
                                        {selectedJob.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                                        <p className="text-blue-400 font-medium text-lg">{selectedJob.company}</p>
                                    </div>
                                </div>

                                {!isApplying ? (
                                    <>
                                        <div className="flex gap-4 mb-8">
                                            {selectedJob.location && <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-slate-700"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>}
                                            {selectedJob.salary && <span className="bg-emerald-900/30 text-emerald-400 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-emerald-800/50"><IndianRupee className="w-4 h-4" /> {selectedJob.salary}</span>}
                                            <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-slate-700"><Briefcase className="w-4 h-4" /> {selectedJob.status}</span>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-2">About the Role</h3>
                                                <p className="text-slate-400 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-2">Requirements</h3>
                                                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                                                    {selectedJob.requirements.map((req, i) => (
                                                        <li key={i}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-6 border-t border-slate-800">
                                            {user ? (
                                                user.role === 'candidate' ? (
                                                    <button
                                                        onClick={() => {
                                                            setIsApplying(true);
                                                            // Auto-fill resume from user profile if available
                                                            if (!resumeText && (user.bio || (user.skills && user.skills.length > 0))) {
                                                                const bioText = user.bio ? `Bio: ${user.bio}\n\n` : '';
                                                                const skillsText = user.skills?.length > 0 ? `Skills: ${user.skills.join(', ')}` : '';
                                                                setResumeText((bioText + skillsText).trim());
                                                            }
                                                        }}
                                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                                    >
                                                        Apply with AJ Assistant
                                                    </button>
                                                ) : (
                                                    <p className="text-center text-slate-500 italic">Signed in as HR. Cannot apply to jobs.</p>
                                                )
                                            ) : (
                                                <div className="text-center p-4 bg-slate-800 rounded-xl border border-slate-700">
                                                    <p className="text-slate-300 mb-3">Sign in to apply and take the AI interview.</p>
                                                    <button onClick={() => window.location.href = '/login'} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Log In</button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-6 pt-4 border-t border-slate-800"
                                    >
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                                <Upload className="text-blue-400" /> Extract Resume Context
                                            </h3>
                                            <div className="flex items-center justify-between mb-6">
                                                <p className="text-slate-400 max-w-md">
                                                    Drag and drop your resume file (.txt), upload it directly, or paste the plaintext below. The AJ Assistant will use this alongside the job requirements to generate dynamic, personalized interview questions.
                                                </p>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id="resume-upload"
                                                        accept=".txt,.pdf,.docx,.csv"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) handleFileUpload(file);
                                                            e.target.value = null; // allow re-uploading the same file
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="resume-upload"
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-300 cursor-pointer transition-colors shadow-sm"
                                                    >
                                                        <FileUp className="w-4 h-4" /> Upload Document
                                                    </label>
                                                </div>
                                            </div>

                                            <div
                                                className={`relative w-full rounded-xl transition-all ${isDragging ? 'bg-blue-600/10 border-blue-500 scale-[1.02]' : 'bg-slate-950 border-slate-700'}`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                {isDragging && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-blue-400 z-10 pointer-events-none">
                                                        <p className="text-blue-300 font-bold text-lg">Drop your resume here</p>
                                                    </div>
                                                )}
                                                <textarea
                                                    className="w-full bg-transparent border border-inherit rounded-xl p-4 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
                                                    placeholder="Drag and drop your resume file here or paste your resume details (experience, skills, projects)..."
                                                    value={resumeText}
                                                    disabled={isParsing}
                                                    onChange={(e) => setResumeText(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setIsApplying(false)}
                                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => handleApply(selectedJob)}
                                                disabled={resumeText.length < 50}
                                                className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                Start AI Interview Session
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
