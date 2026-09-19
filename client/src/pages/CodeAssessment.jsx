import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CodeAssessment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // interviewId arrives either as query param (?interview=<id>) or route state
  const interviewId = location.state?.interviewId || new URLSearchParams(location.search).get('interview');
  const [task, setTask] = useState(null);
  const [code, setCode] = useState('function solution(input) {\n  // write your solution; return output\n  return input;\n}');
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/api/assessments/${id}`).then((r) => {
      setTask(r.data);
      if (r.data.starterCode) setCode(r.data.starterCode);
    }).catch(() => setMsg('Failed to load assessment'));
  }, [id]);

  const run = async () => {
    setMsg('Running...');
    const { data } = await api.post(`/api/assessments/${id}/run`, { code, language: 'javascript' });
    setResult(data);
    setMsg('');
  };

  // PRD §83 — submitting the solution completes the interview loop: the
  // server-side final analysis runs with the coding score included, then the
  // candidate is taken to their report.
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setMsg('Submitting...');
    try {
      const { data } = await api.post(`/api/assessments/${id}/submit`, {
        code,
        language: 'javascript',
        interviewId: interviewId || undefined,
      });
      setResult({ passed: data.passed, total: data.total, score: data.score, results: data.results });
      if (interviewId) {
        setMsg(`Code submitted (${data.score}/100). Generating your final AI report...`);
        await api.post(`/api/interviews/${interviewId}/complete`, {});
        navigate(`/interview/${interviewId}/result`);
      } else {
        setMsg(`Submitted! Score ${data.score}/100`);
      }
    } catch (e) {
      console.error('Submission failed', e);
      setMsg(e.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!task) return <div className="p-12 text-center text-slate-400">{msg || 'Loading...'}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
      {interviewId && (
        <div className="md:col-span-2 text-sm bg-indigo-600/10 border border-indigo-500/30 text-indigo-200 rounded-xl px-4 py-2">
          This coding challenge is part of your AI interview. Submitting your solution will generate your final report.
        </div>
      )}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <p className="text-sm text-slate-400 mt-2 whitespace-pre-line">{task.description}</p>
        <div className="mt-4 text-sm">
          <p className="font-bold">Test cases: {task.testCases?.length || 0} ({task.testCases?.filter((t) => t.hidden).length || 0} hidden)</p>
          {(task.testCases || []).filter((t) => !t.hidden).map((t, i) => (
            <div key={i} className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono text-xs">
              <p>Input: {JSON.stringify(t.input)}</p>
              <p>Expected: {JSON.stringify(t.expected)}</p>
            </div>
          ))}
        </div>
        {result && (
          <div className="mt-4 text-sm bg-slate-950 border border-slate-800 rounded-xl p-3">
            <p className="font-bold">Passed {result.passed}/{result.total} — Score {result.score}</p>
            {(result.results || []).map((r, i) => (
              <p key={i} className={r.passed ? 'text-emerald-400' : 'text-red-400'}>Test {i + 1}{r.hidden ? ' (hidden)' : ''}: {r.passed ? 'PASS' : `FAIL ${r.error || ''}`}</p>
            ))}
          </div>
        )}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-bold mb-2">Code Editor (JavaScript MVP)</h2>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} className="w-full h-80 bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-sm" />
        <div className="flex gap-3 mt-3">
          <button onClick={run} className="flex-1 py-3 bg-slate-700 rounded-xl font-bold">Run Code</button>
          <button onClick={submit} disabled={submitting} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit'}</button>
        </div>
        {msg && <p className="text-sm text-slate-400 mt-2">{msg}</p>}
      </div>
    </div>
  );
}
