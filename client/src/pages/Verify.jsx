import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Verify() {
  const [params] = useSearchParams();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [mode, setMode] = useState(params.get('mode') || 'email');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const send = async () => {
    const { data } = await api.post(mode === 'email' ? '/api/auth/send-email-otp' : '/api/auth/send-mobile-otp', mode === 'mobile' ? { mobile: params.get('mobile') || '' } : {});
    setMsg('OTP sent' + (data.devCode ? ` (dev: ${data.devCode})` : ''));
  };

  const verify = async (e) => {
    e.preventDefault();
    const { data } = await api.post(mode === 'email' ? '/api/auth/verify-email-otp' : '/api/auth/verify-mobile-otp', { code });
    setMsg(data.message);
    await refreshUser();
    setTimeout(() => navigate('/profile'), 800);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-2">Verify your {mode}</h1>
      <p className="text-slate-400 mb-6">PRD requires email/mobile verification before full access.</p>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('email')} className={`px-4 py-2 rounded-xl ${mode === 'email' ? 'bg-blue-600' : 'bg-slate-800'}`}>Email</button>
        <button onClick={() => setMode('mobile')} className={`px-4 py-2 rounded-xl ${mode === 'mobile' ? 'bg-blue-600' : 'bg-slate-800'}`}>Mobile</button>
        <button onClick={send} className="ml-auto px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">Send OTP</button>
      </div>
      <form onSubmit={verify} className="space-y-4">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 tracking-[0.5em] text-center text-xl" />
        <button className="w-full py-3 bg-blue-600 rounded-xl font-bold">Verify</button>
      </form>
      {msg && <p className="mt-4 text-sm text-emerald-400">{msg}</p>}
      <Link to="/profile" className="block mt-6 text-sm text-slate-400">Back to profile</Link>
    </div>
  );
}
