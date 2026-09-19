import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Bot, User as UserIcon, RotateCcw } from 'lucide-react';
import api from '../services/api';

const WELCOME = 'Hi! I am your Skill Assistant — a technical mentor, not an interviewer. Ask me about concepts (e.g. "explain Java", "what are Hooks in React?"), interview prep, resume tips, or coding help.';

const SUGGESTIONS = ['Tell me about Java', 'Explain Hooks in React', 'What is the event loop in JavaScript?', 'Tips to improve my resume', 'Explain system design basics', 'How do SQL JOINs work?'];

/* Tiny renderer: **bold**, `code`, and paragraph/numbered lines. */
function RichText({ text }) {
  const blocks = String(text).split('\n');
  const inline = (s) => {
    const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 border border-slate-700 text-cortex-400 text-[0.85em]">{p.slice(1, -1)}</code>;
      return <React.Fragment key={i}>{p}</React.Fragment>;
    });
  };
  return (
    <div className="space-y-1.5">
      {blocks.map((line, i) => line.trim() ? <p key={i} className={/^\d+\./.test(line.trim()) ? 'pl-2' : ''}>{inline(line)}</p> : <div key={i} className="h-1" />)}
    </div>
  );
}

export default function SkillAssistant() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async (question) => {
    const q = String(question || input).trim();
    if (!q || loading) return;
    const history = [...messages, { role: 'user', content: q }];
    setMessages(history);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/ai/chat', {
        message: q,
        history: history.slice(1, -1).map(({ role, content }) => ({ role, content })),
      });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Sorry, I could not answer that. Try rephrasing?' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connection issue — please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([{ role: 'assistant', content: WELCOME }]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-neon" /> Skill Assistant
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your AI mentor — concepts, interview prep, resume &amp; code.</p>
        </div>
        <button onClick={reset} className="glass rounded-xl px-3.5 py-2 text-xs text-slate-300 inline-flex items-center gap-1.5 hover:border-indigo-400/40 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div ref={scrollRef} className="glass rounded-3xl p-5 h-[52vh] overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${m.role === 'user' ? 'bg-gradient-to-br from-cortex-500 to-plasma' : 'bg-slate-800 border border-slate-700'}`}>
              {m.role === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-neon" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-br from-cortex-500/80 to-plasma/80 text-white rounded-tr-sm' : 'glass rounded-tl-sm text-slate-300'}`}>
              {m.role === 'user' ? m.content : <RichText text={m.content} />}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-neon" />
            </div>
            <div className="glass px-4 py-3.5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
              {[0, 1, 2].map((d) => (
                <motion.span key={d} className="w-1.5 h-1.5 rounded-full bg-cortex-400"
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} disabled={loading}
            className="text-xs px-3 py-1.5 glass rounded-full text-slate-300 hover:border-indigo-400/50 hover:text-white transition-colors disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — e.g. 'explain closures' or 'resume tips'"
          className="flex-1 bg-slate-950/70 border border-slate-700 focus:border-indigo-500/60 rounded-2xl px-5 py-3.5 text-sm outline-none transition-colors"
        />
        <motion.button whileTap={{ scale: 0.94 }} type="submit" disabled={loading || !input.trim()}
          className="px-5 rounded-2xl bg-gradient-to-r from-cortex-500 to-plasma font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-40 inline-flex items-center gap-2">
          <Send className="w-4 h-4" /> Send
        </motion.button>
      </form>
    </div>
  );
}
