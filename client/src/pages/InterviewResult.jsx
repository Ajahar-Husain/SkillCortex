import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function InterviewResult() {
  const id = window.location.pathname.split('/')[2];
  const [report, setReport] = useState(null);
  useEffect(() => { api.get(`/api/interviews/${id}/report`).then((r) => setReport(r.data)).catch(() => {}); }, [id]);
  if (!report) return <div className="p-12 text-center text-slate-400">Loading report...</div>;
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">Interview Report — {report.jobTitle}</h1>
      <p className="text-slate-400">Candidate: {report.candidateName} • {new Date(report.createdAt).toLocaleString()}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[['Overall', report.aiScore100], ['Technical', report.technicalScore], ['Communication', report.communicationScore], ['Problem Solving', report.problemSolvingScore]].map(([k, v]) => (
          <div key={k} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-emerald-400">{v ?? '—'}</p>
            <p className="text-xs text-slate-400">{k}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 inline-block px-4 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-sm">Recommendation: <b>{report.recommendation}</b></div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
        <h2 className="font-bold mb-2">AI Feedback</h2>
        <p className="text-sm text-slate-300 whitespace-pre-line">{report.aiFeedback}</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div><h3 className="text-sm font-bold text-emerald-400">Strengths</h3><ul className="text-sm text-slate-300 list-disc ml-5">{(report.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div><h3 className="text-sm font-bold text-red-400">Weaknesses</h3><ul className="text-sm text-slate-300 list-disc ml-5">{(report.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
        <h2 className="font-bold mb-3">Answer Analysis</h2>
        {(report.questionEvidence || report.questionAnalysis || []).map((q, i) => (
          <div key={i} className="mb-4 text-sm border-b border-slate-800 pb-3">
            <p className="font-bold">Q{i + 1}: {q.question} <span className="text-emerald-400">({q.score}/5)</span></p>
            <p className="text-slate-400 mt-1">Your answer: {q.answer}</p>
            <p className="text-slate-300 mt-1">AI review: {q.review}</p>
            {q.dimensions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(q.dimensions).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-xs capitalize">{k}: {v}</span>
                ))}
              </div>
            )}
            {!!(q.coveredConcepts || []).length && (
              <p className="text-emerald-400 text-xs mt-2">Covered concepts: {(q.coveredConcepts || []).join(', ')}</p>
            )}
            {!!(q.missedConcepts || []).length && (
              <p className="text-red-400 text-xs mt-1">Missed concepts: {(q.missedConcepts || []).join(', ')}</p>
            )}
            <p className="text-yellow-300 mt-1">Improve: {q.improvement}</p>
          </div>
        ))}
        {!(report.questionEvidence || report.questionAnalysis || []).length && <p className="text-sm text-slate-400">Transcript-only report.</p>}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
        <h2 className="font-bold mb-2">Coding & Integrity</h2>
        <p className="text-sm text-slate-300">Coding: {report.codingResult ? `${report.codingResult.passed}/${report.codingResult.total} passed (score ${report.codingResult.score})` : 'No coding task'}</p>
        <p className="text-sm text-slate-300">Integrity: score {report.integritySummary?.score ?? '—'}, tab switches {report.integritySummary?.tabSwitches ?? 0}, fullscreen exits {report.integritySummary?.fullscreenExits ?? 0}</p>
      </div>
      <Link to="/dashboard" className="inline-block mt-6 text-sm text-blue-400">← Back to dashboard</Link>
    </div>
  );
}
