import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, IndianRupee, Clock, Building, Briefcase, Search, Upload, X, FileUp, AlertCircle, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [workMode, setWorkMode] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [resumeText, setResumeText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [showFilters, setShowFilters] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('q', searchTerm);
            if (workMode) params.set('workMode', workMode);
            if (employmentType) params.set('employmentType', employmentType);
            // Salary + experience level are filtered client-side, so request the
            // full catalogue (server default page size is 20) to keep every
            // filter option populated with cards.
            params.set('limit', '100');
            const res = await api.get('/api/jobs?' + params.toString());
            let fetchedJobs = res.data.jobs || res.data;
            
            // Client-side filtering for salary and experience
            if (salaryMin) {
                fetchedJobs = fetchedJobs.filter(job => (job.salaryMin || 0) >= parseInt(salaryMin));
            }
            if (experienceLevel) {
                if (experienceLevel === 'Entry') fetchedJobs = fetchedJobs.filter(job => (job.experienceMin || 0) <= 2);
                else if (experienceLevel === 'Mid') fetchedJobs = fetchedJobs.filter(job => (job.experienceMin || 0) >= 2 && (job.experienceMin || 0) <= 5);
                else if (experienceLevel === 'Senior') fetchedJobs = fetchedJobs.filter(job => (job.experienceMin || 0) >= 5);
            }
            
            setJobs(fetchedJobs);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, [searchTerm, workMode, employmentType, salaryMin, experienceLevel]);

    const clearFilters = () => {
        setWorkMode('');
        setEmploymentType('');
        setSalaryMin('');
        setExperienceLevel('');
    };

    const activeFiltersCount = [workMode, employmentType, salaryMin, experienceLevel].filter(Boolean).length;

    const handleApply = async (job) => {
        if (!user) return navigate('/login');
        try {
            const { data } = await api.post('/api/applications', { jobId: job._id, resumeText });
            navigate('/interview', { state: { job, resume: resumeText, applicationId: data.application?._id } });
        } catch (e) {
            if (e.response?.data?.application) {
                navigate('/interview', { state: { job, resume: resumeText, applicationId: e.response.data.application._id } });
            } else {
                navigate('/interview', { state: { job, resume: resumeText } });
            }
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const ALLOWED_EXT = /\.(pdf|docx?|txt|csv)$/i;
    const MAX_FILE_MB = 5;

    const handleFileUpload = async (file) => {
        if (!file) return;
        if (!ALLOWED_EXT.test(file.name)) {
            setResumeText('');
            setUploadError('Unsupported file format. Please upload a PDF, DOCX, TXT or CSV file.');
            return;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setResumeText('');
            setUploadError(`File is too large (max ${MAX_FILE_MB} MB).`);
            return;
        }
        setUploadError('');
        setIsParsing(true);
        setResumeText('Parsing document, please wait...');
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await api.post('/api/upload/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeText(res.data.text || '');
        } catch (err) {
            console.error('Failed to parse resume:', err);
            setResumeText('');
            setUploadError(err.response?.data?.message || 'Failed to extract text from this document.');
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
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
            {/* Sidebar Filters */}
            <div className={`${showFilters ? 'w-80' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden`}>
                <div className="sticky top-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </h3>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Work Mode */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Work Mode</label>
                            <div className="space-y-2">
                                {['Remote', 'Hybrid', 'Office'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setWorkMode(workMode === mode ? '' : mode)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            workMode === mode
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Employment Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Employment Type</label>
                            <div className="space-y-2">
                                {['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setEmploymentType(employmentType === type ? '' : type)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            employmentType === type
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Experience Level</label>
                            <div className="space-y-2">
                                {['Entry', 'Mid', 'Senior'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setExperienceLevel(experienceLevel === level ? '' : level)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            experienceLevel === level
                                                ? 'bg-purple-600 text-white shadow-lg'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                        }`}
                                    >
                                        {level} Level
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Salary Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Minimum Salary</label>
                            <select
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Any</option>
                                <option value="300000">₹3 LPA+</option>
                                <option value="600000">₹6 LPA+</option>
                                <option value="1000000">₹10 LPA+</option>
                                <option value="1500000">₹15 LPA+</option>
                                <option value="2000000">₹20 LPA+</option>
                                <option value="2500000">₹25 LPA+</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Header & Search */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2">Discover Opportunities</h1>
                            <p className="text-slate-400">
                                Find your next role and prove your skills with AI Interview
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
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
                    <>
                        <div className="mb-4 text-slate-400">
                            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
                        </div>
                        
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            {jobs.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-slate-500 text-lg">
                                    No jobs found. Try adjusting your filters.
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <motion.div
                                        key={job._id}
                                        variants={itemVariants}
                                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/80 transition-all hover:-translate-y-1 group flex flex-col h-full cursor-pointer shadow-lg hover:shadow-blue-900/20"
                                        onClick={() => setSelectedJob(job)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                                                {job.company.charAt(0)}
                                            </div>
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full font-medium border border-slate-700">
                                                    {job.employmentType || 'Full Time'}
                                                </span>
                                                {job.workMode && (
                                                    <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full font-medium border border-blue-800/50">
                                                        {job.workMode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">{job.title}</h3>
                                        <div className="flex items-center text-slate-400 text-sm font-medium mb-3">
                                            <Building className="w-4 h-4 mr-1.5" /> {job.company}
                                        </div>

                                        <div className="mt-auto space-y-2">
                                            {job.location && (
                                                <div className="flex items-center text-slate-400 text-xs">
                                                    <MapPin className="w-3 h-3 mr-2 text-slate-500" /> {job.location}
                                                </div>
                                            )}
                                            {job.salary && (
                                                <div className="flex items-center text-slate-400 text-xs">
                                                    <IndianRupee className="w-3 h-3 mr-2 text-green-500" /> {job.salary}
                                                </div>
                                            )}
                                            <div className="flex items-center text-slate-400 text-xs">
                                                <Clock className="w-3 h-3 mr-2 text-slate-500" /> {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                                            {job.requirements.slice(0, 3).map((req, i) => (
                                                <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                                    {req}
                                                </span>
                                            ))}
                                            {job.requirements.length > 3 && (
                                                <span className="text-xs bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded">+{job.requirements.length - 3}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </>
                )}
            </div>

            {/* Modal - keeping your existing modal code */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => { setSelectedJob(null); setIsApplying(false); }}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10"
                        >
                            <button
                                onClick={() => { setSelectedJob(null); setIsApplying(false); }}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800 rounded-full p-2 transition-colors z-10"
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
                                        <div className="flex gap-4 mb-8 flex-wrap">
                                            {selectedJob.location && <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-slate-700"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>}
                                            {selectedJob.salary && <span className="bg-emerald-900/30 text-emerald-400 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-emerald-800/50"><IndianRupee className="w-4 h-4" /> {selectedJob.salary}</span>}
                                            <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-slate-700"><Briefcase className="w-4 h-4" /> {selectedJob.employmentType || 'Full Time'}</span>
                                            {selectedJob.workMode && <span className="bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded-lg text-sm border border-blue-800/50">{selectedJob.workMode}</span>}
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
                                                            if (!resumeText && (user.bio || (user.skills && user.skills.length > 0))) {
                                                                const bioText = user.bio ? `Bio: ${user.bio}\n\n` : '';
                                                                const skillsText = user.skills?.length > 0 ? `Skills: ${user.skills.join(', ')}` : '';
                                                                setResumeText((bioText + skillsText).trim());
                                                            }
                                                        }}
                                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                                                    >
                                                        Apply with AJ Assistant
                                                    </button>
                                                ) : (
                                                    <p className="text-center text-slate-500 italic">Signed in as HR. Cannot apply to jobs.</p>
                                                )
                                            ) : (
                                                <div className="text-center p-4 bg-slate-800 rounded-xl border border-slate-700">
                                                    <p className="text-slate-300 mb-3">Sign in to apply and take the AI interview.</p>
                                                    <button onClick={() => navigate('/login')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Log In</button>
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
                                                <p className="text-slate-400 max-w-md text-sm">
                                                    Upload your resume or paste your details below.
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
                                                            e.target.value = null;
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="resume-upload"
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-300 cursor-pointer transition-colors"
                                                    >
                                                        <FileUp className="w-4 h-4" /> Upload
                                                    </label>
                                                </div>
                                            </div>

                                            <div
                                                className={`relative w-full rounded-xl transition-all ${isDragging ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-700'}`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                {isDragging && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-blue-400 z-10 pointer-events-none">
                                                        <p className="text-blue-300 font-bold">Drop here</p>
                                                    </div>
                                                )}
                                                <textarea
                                                    className="w-full bg-transparent border border-inherit rounded-xl p-4 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
                                                    placeholder="Paste your resume details..."
                                                    value={resumeText}
                                                    disabled={isParsing}
                                                    onChange={(e) => { setUploadError(''); setResumeText(e.target.value); }}
                                                />
                                            </div>
                                            {uploadError && (
                                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mt-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>{uploadError}</span>
                                                </div>
                                            )}
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
                                                className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Start Interview
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
