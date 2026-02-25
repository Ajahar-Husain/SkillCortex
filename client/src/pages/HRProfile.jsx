import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Users, FileText, CheckCircle, Video, X, Plus } from 'lucide-react';
import axios from 'axios';

export default function HRProfile({ user }) {
    const [isPosting, setIsPosting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: user.company || '',
        description: '',
        requirements: '',
        location: '',
        salary: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // We should also fetch the HR's posted jobs and candidate reviews
    const [myJobs, setMyJobs] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                // The /api/jobs endpoint returns all jobs, we can filter client-side for now
                // or ideally have a /api/jobs/me endpoint. Filtering client-side:
                const res = await axios.get('/api/jobs');
                const hrJobs = res.data.filter(j => j.hrRef === user.id || j.hrRef === user._id);
                setMyJobs(hrJobs);

                // Fetch Candidate Reviews
                const reviewsRes = await axios.get('/api/jobs/reviews');
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error("Failed to fetch jobs or reviews", err);
            }
        };
        fetchMyJobs();
    }, [user._id, user.id]);

    const handlePostJob = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try {
            const reqsArray = formData.requirements.split(',').map(r => r.trim()).filter(r => r);
            const res = await axios.post('/api/jobs', {
                ...formData,
                requirements: reqsArray
            });
            setMyJobs([...myJobs, res.data]);
            setSuccess('Job posted successfully!');
            setTimeout(() => {
                setIsPosting(false);
                setSuccess('');
                setFormData(prev => ({ ...prev, title: '', description: '', requirements: '', location: '', salary: '' }));
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">HR Dashboard</h1>
                    <p className="text-slate-400">Welcome back, {user.name}. Manage jobs and candidates here.</p>
                </div>
                <button onClick={() => setIsPosting(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                    <Plus className="w-5 h-5" /> Post New Job
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { title: 'Total Jobs Posted', val: myJobs.length.toString(), icon: Building, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { title: 'Total Candidates', val: '0', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { title: 'AI Screened (Passed)', val: '0', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5"
                    >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.val}</div>
                            <div className="text-sm text-slate-400 font-medium">{stat.title}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Job Postings Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building className="text-blue-400 w-5 h-5" /> Your Active Postings
                    </h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-80 overflow-y-auto">
                        {myJobs.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-center">
                                <FileText className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-slate-300 mb-2">No Active Postings</h3>
                                <p className="text-slate-500 max-w-sm mb-6">Create a job posting to start letting AJ Assistant interview candidates for you.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myJobs.map(job => (
                                    <div key={job._id} className="border border-slate-700 bg-slate-800/50 p-5 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <h4 className="text-white font-bold">{job.title}</h4>
                                            <p className="text-sm text-slate-400">{job.location} &bull; {job.status}</p>
                                        </div>
                                        <button className="text-blue-400 text-sm hover:underline">View Candidates</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Candidate Reviews Area */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle className="text-emerald-400 w-5 h-5" /> Candidate AI Reviews
                    </h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                            Candidates that complete the AJ Assistant AI technical screening will appear here with an AI-generated performance review.
                        </p>

                        {reviews.length === 0 ? (
                            <div className="py-8 border border-dashed border-slate-700 bg-slate-800/30 rounded-2xl flex flex-col items-center justify-center">
                                <FileText className="w-10 h-10 text-slate-600 mb-2 opacity-50" />
                                <span className="text-sm font-medium text-slate-400">No candidate reviews yet</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review._id} className="border border-slate-700 bg-slate-800/50 p-5 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-white font-bold">{review.candidateName}</h4>
                                                <p className="text-sm text-blue-400 font-medium">Applied for: {review.jobTitle}</p>
                                            </div>
                                            <div className="bg-emerald-900/30 border border-emerald-500/30 px-3 py-1 rounded-lg">
                                                <span className="text-emerald-400 font-bold text-sm">Rating: {review.aiScore}/5</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                            <strong>AI Analysis:</strong> {review.aiFeedback}
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                                <Video className="w-4 h-4" /> Schedule Follow-up Call
                                            </button>
                                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg transition-colors border border-slate-600">
                                                View Transcript
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Post Job Modal */}
            <AnimatePresence>
                {isPosting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setIsPosting(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl z-10 p-8"
                        >
                            <button
                                onClick={() => setIsPosting(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800 rounded-full p-2 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6">Post a New Job</h2>

                            {error && <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">{error}</div>}
                            {success && <div className="p-3 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-sm text-center">{success}</div>}

                            <form onSubmit={handlePostJob} className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Job Title *</label>
                                        <input required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior React Developer" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Company Name *</label>
                                        <input required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Your Company" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                                        <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Remote, New York, etc." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Salary Range</label>
                                        <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} placeholder="₹10L - ₹15L" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description *</label>
                                    <textarea required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 min-h-[120px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the role and responsibilities..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Requirements (comma separated) *</label>
                                    <textarea required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} placeholder="React, Node.js, 5+ years experience, Strong communication" />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-4">
                                    {isSubmitting ? 'Posting...' : 'Publish Job Posting'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
