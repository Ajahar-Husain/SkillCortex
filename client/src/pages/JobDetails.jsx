import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [match, setMatch] = useState(null);
  const [applying, setApplying] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/jobs/${id}`).then((r) => setJob(r.data)).catch(() => setJob(null));
  }, [id]);

  const [resumeError, setResumeError] = useState('');
  const [parsing, setParsing] = useState(false);

  const uploadResume = async (file) => {
    if (!file) return;
    setParsing(true);
    setResumeError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const { data } = await api.post('/api/upload/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResumeText(data.text || '');
    } catch (e) {
      console.error('Failed to parse resume:', e);
      setResumeText('');
      setResumeError(e.response?.data?.message || 'Failed to extract text from this document. Please paste your details instead.');
    } finally {
      setParsing(false);
    }
  };

  const apply = async () => {
    if (!user) return navigate('/login');
    setApplying(true);
    try {
      const { data } = await api.post('/api/applications', { jobId: id, resumeText });
      setMatch(data);
    } finally {
      setApplying(false);
    }
  };

  if (!job) return <div className="p-12 text-center text-slate-400">Loading job...</div>;
  const cfg = job.interviewConfig || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/jobs" className="text-sm text-blue-400">← All jobs</Link>
      <h1 className="text-4xl font-extrabold mt-2">{job.title}</h1>
      <p className="text-slate-400 mt-1">{job.company} • {job.location} • {job.salary}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {(job.skills?.length ? job.skills : job.requirements || []).map((s) => (
          <span key={s} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs">{s}</span>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold mb-2">Description</h2>
          <p className="text-slate-300 whitespace-pre-line text-sm">{job.description}</p>
          {job.responsibilities && (<><h2 className="font-bold mt-4 mb-2">Responsibilities</h2><p className="text-slate-300 text-sm whitespace-pre-line">{job.responsibilities}</p></>)}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold mb-3">AI Assessment</h2>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>Duration: {cfg.durationMin || 10} min</li>
            <li>Difficulty: {cfg.difficulty || 'Intermediate'}</li>
            <li>Questions: {cfg.numQuestions || 8}</li>
            <li>Coding: {job.codingConfig?.required ? 'Required' : 'Optional'}</li>
          </ul>
          <div className="mt-4">
            <label className="text-xs text-slate-400">Resume (PDF/DOCX/TXT/CSV)</label>
            <input type="file" accept=".pdf,.docx,.doc,.txt,.csv" disabled={parsing} onChange={(e) => { uploadResume(e.target.files[0]); e.target.value = null; }} className="mt-1 text-xs" />
            {parsing && <p className="mt-1 text-xs text-blue-400">Parsing document...</p>}
            {resumeError && <p className="mt-1 text-xs text-red-400">{resumeError}</p>}
            <textarea value={resumeText} onChange={(e) => { setResumeError(''); setResumeText(e.target.value); }} placeholder="Or paste resume text..." className="mt-2 w-full h-28 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs" />
          </div>
          <button onClick={apply} disabled={applying || resumeText.length < 20} className="mt-3 w-full py-3 bg-blue-600 rounded-xl font-bold disabled:opacity-50">Apply & Start Assessment</button>
          {match && (
            <div className="mt-4 text-sm bg-slate-950 border border-slate-800 rounded-xl p-3">
              <p>Match: <b className="text-emerald-400">{match.matchScore}%</b></p>
              <p className="text-slate-400">Matched: {(match.matchedSkills || []).join(', ') || '—'}</p>
              <p className="text-slate-400">Missing: {(match.missingSkills || []).join(', ') || '—'}</p>
              <button onClick={() => navigate('/interview', { state: { job, resume: resumeText, applicationId: match.application?._id } })} className="mt-2 w-full py-2 bg-indigo-600 rounded-xl font-bold">Start AJ Interview</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
