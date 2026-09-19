import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Applications() {
  const [apps, setApps] = useState([]);
  useEffect(() => { api.get('/api/applications').then((r) => setApps(r.data)).catch(() => {}); }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      <div className="space-y-3">
        {apps.map((a) => (
          <div key={a._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{a.jobId?.title || 'Job'}</p>
              <p className="text-xs text-slate-400">{a.jobId?.company} • Match {a.matchScore}% • {new Date(a.appliedAt || a.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 bg-slate-800 rounded-full">{a.status}</span>
              {a.interviewId && <Link to={`/interview/${a.interviewId}/result`} className="text-xs px-3 py-1 bg-blue-600 rounded-full">Report</Link>}
            </div>
          </div>
        ))}
        {!apps.length && <p className="text-slate-400">No applications yet. <Link to="/jobs" className="text-blue-400">Browse jobs</Link></p>}
      </div>
    </div>
  );
}
