import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HRDashboardView() {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', company: '', description: '', requirements: '', location: '', salary: '', durationMin: 10, difficulty: 'Intermediate', codingRequired: false });
  const { user } = useAuth();

  const load = async () => {
    const [s, a, r, j] = await Promise.all([
      api.get('/api/analytics/hr').catch(() => ({ data: null })),
      api.get('/api/applications').catch(() => ({ data: [] })),
      api.get('/api/jobs/reviews').catch(() => ({ data: [] })),
      api.get('/api/jobs/mine').catch(() => ({ data: [] })),
    ]);
    setStats(s.data);
    setApps(a.data || []);
    setReviews(Array.isArray(r.data) ? r.data : []);
    setJobs(j.data || []);
  };

  useEffect(() => { load(); }, []);

  const postJob = async (e) => {
    e.preventDefault();
    await api.post('/api/jobs', { ...form, interviewConfig: { durationMin: Number(form.durationMin), difficulty: form.difficulty }, codingConfig: { required: form.codingRequired } });
    setForm({ title: '', company: user?.company || '', description: '', requirements: '', location: '', salary: '', durationMin: 10, difficulty: 'Intermediate', codingRequired: false });
    load();
  };

  const setStatus = async (id, status) => {
    await api.patch(`/api/applications/${id}/status`, { status });
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">HR Dashboard</h1>
      <p className="text-slate-400">Company: {user?.company || '—'} • {user?.email}</p>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          {[['Jobs', stats.activeJobs], ['Applications', stats.applications], ['Interviews', stats.interviews], ['Avg Score', stats.avgScore], ['Shortlisted', stats.shortlisted]].map(([k, v]) => (
            <div key={k} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black">{v}</p>
              <p className="text-xs text-slate-400">{k}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <form onSubmit={postJob} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h2 className="font-bold">Post Job + Interview Config</h2>
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm" />
          <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm h-20" />
          <input placeholder="Requirements (comma separated)" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm" />
            <input placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm">
              {[10, 15, 30, 45, 60].map((d) => <option key={d} value={d}>{d} min</option>)}
            </select>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm">
              {['Easy', 'Intermediate', 'Advanced'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={form.codingRequired} onChange={(e) => setForm({ ...form, codingRequired: e.target.checked })} /> Coding required</label>
          <button className="w-full py-2 bg-blue-600 rounded-xl font-bold text-sm">Publish Job</button>
          <div className="text-xs text-slate-400">My jobs: {jobs.length}</div>
        </form>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-bold mb-3">Candidate Ranking</h2>
            {[...reviews].sort((a, b) => (b.aiScore100 || 0) - (a.aiScore100 || 0)).map((r) => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b border-slate-800 text-sm">
                <span>{r.candidateName} • {r.jobTitle} • <b className="text-emerald-400">{r.aiScore100}</b> • {r.recommendation}</span>
                <Link to={`/interview/${r.interviewId}/result`} className="text-blue-400">Report</Link>
              </div>
            ))}
            {!reviews.length && <p className="text-sm text-slate-400">No assessments yet.</p>}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-bold mb-3">Applications</h2>
            {apps.map((a) => (
              <div key={a._id} className="flex items-center justify-between py-2 border-b border-slate-800 text-sm">
                <span>{a.candidateId?.name || 'Candidate'} • match {a.matchScore}% • {a.status}</span>
                <div className="flex gap-2">
                  <button onClick={() => setStatus(a._id, 'SHORTLISTED')} className="px-2 py-1 bg-emerald-600 rounded text-xs">Shortlist</button>
                  <button onClick={() => setStatus(a._id, 'REJECTED')} className="px-2 py-1 bg-red-600 rounded text-xs">Reject</button>
                </div>
              </div>
            ))}
            {!apps.length && <p className="text-sm text-slate-400">No applications yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
