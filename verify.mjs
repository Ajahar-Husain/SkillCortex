// Temporary verification script — PRD compliance audit.
import fs from 'fs';
import path from 'path';

const clientSrc = 'd:/SkillCortex/client/src';
const server = 'd:/SkillCortex/server';
const out = [];

function walk(dir, filter = () => true, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, filter, acc);
    else if (filter(p)) acc.push(p);
  }
  return acc;
}

out.push('===== RAW AXIOS USAGE IN CLIENT (should be none) =====');
let rawAxios = 0;
for (const f of walk(clientSrc, (p) => /\.(jsx?|tsx?)$/.test(p))) {
  if (f.endsWith('services\\api.js') || f.endsWith('services/api.js')) continue;
  const src = fs.readFileSync(f, 'utf8');
  src.split(/\r?\n/).forEach((line, i) => {
    if (/\baxios\.(get|post|put|patch|delete)\(/.test(line) || /from 'axios'/.test(line)) {
      out.push(`  ${path.relative(clientSrc, f)}:${i + 1}: ${line.trim()}`);
      rawAxios++;
    }
  });
}
out.push(rawAxios === 0 ? '  OK: no raw axios usage' : `  FOUND ${rawAxios} raw axios usages`);

out.push('');
out.push('===== CLIENT PAGE API CALLS =====');
for (const f of walk(clientSrc, (p) => /pages\\.*\.jsx$/.test(p) || /components\\.*\.jsx$/.test(p))) {
  const src = fs.readFileSync(f, 'utf8');
  const calls = [...src.matchAll(/api\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)/g)].map((m) => `${m[1].toUpperCase()} ${m[2]}`);
  if (calls.length) out.push(`  ${path.relative(clientSrc, f)}: ${[...new Set(calls)].join(', ')}`);
}

out.push('');
out.push('===== SERVER MOUNTED ROUTES =====');
const idx = fs.readFileSync(path.join(server, 'index.js'), 'utf8');
[...idx.matchAll(/app\.use\('([^']+)',\s*(\w+)\)/g)].forEach((m) => out.push(`  ${m[1]} -> ${m[2]}`));

out.push('');
out.push('===== SERVER ROUTE HANDLERS =====');
for (const f of walk(path.join(server, 'routes'), (p) => p.endsWith('.js'))) {
  const src = fs.readFileSync(f, 'utf8');
  const rs = [...src.matchAll(/router\.(get|post|patch|put|delete)\(\s*'([^']*)'/g)].map((m) => `${m[1].toUpperCase()} ${m[2]}`);
  out.push(`  ${path.basename(f)} (${rs.length}): ${rs.join(', ')}`);
}

out.push('');
out.push('===== PRD REQUIRED ENDPOINTS PRESENT? =====');
const required = [
  ['auth', 'POST /api/auth/register', 'routes/auth.js', "'/register'"],
  ['auth', 'POST /api/auth/login', 'routes/auth.js', "'/login'"],
  ['auth', 'POST /api/auth/google', 'routes/auth.js', "'/google'"],
  ['auth', 'POST /api/auth/send-email-otp', 'routes/auth.js', "'/send-email-otp'"],
  ['auth', 'POST /api/auth/verify-email-otp', 'routes/auth.js', "'/verify-email-otp'"],
  ['auth', 'POST /api/auth/send-mobile-otp', 'routes/auth.js', "'/send-mobile-otp'"],
  ['auth', 'POST /api/auth/verify-mobile-otp', 'routes/auth.js', "'/verify-mobile-otp'"],
  ['auth', 'POST /api/auth/forgot-password', 'routes/auth.js', "'/forgot-password'"],
  ['auth', 'POST /api/auth/reset-password', 'routes/auth.js', "'/reset-password'"],
  ['auth', 'POST /api/auth/refresh', 'routes/auth.js', "'/refresh'"],
  ['auth', 'POST /api/auth/logout', 'routes/auth.js', "'/logout'"],
  ['jobs', 'GET /api/jobs', 'routes/jobs.js', "router.get('/'"],
  ['jobs', 'GET /api/jobs/:id', 'routes/jobs.js', "'/:id'"],
  ['jobs', 'POST /api/jobs', 'routes/jobs.js', "'/'"],
  ['jobs', 'PATCH /api/jobs/:id', 'routes/jobs.js', "'/:id'"],
  ['jobs', 'DELETE /api/jobs/:id', 'routes/jobs.js', "'/:id'"],
  ['app', 'POST /api/applications', 'routes/applications.js', "'/'"],
  ['app', 'GET /api/applications', 'routes/applications.js', "'/'"],
  ['app', 'GET /api/applications/:id', 'routes/applications.js', "'/:id'"],
  ['app', 'PATCH /api/applications/:id/status', 'routes/applications.js', "'/:id/status'"],
  ['res', 'POST /api/resumes/upload', 'routes/upload.js', "'/upload'"],
  ['res', 'GET /api/resumes', 'routes/upload.js', "'/'"],
  ['res', 'GET /api/resumes/:id', 'routes/upload.js', "'/:id'"],
  ['int', 'POST /api/interviews/start', 'routes/interviews.js', "'/start'"],
  ['int', 'GET /api/interviews/:id', 'routes/interviews.js', "'/:id'"],
  ['int', 'POST /api/interviews/:id/answer', 'routes/interviews.js', "'/:id/answer'"],
  ['int', 'POST /api/interviews/:id/event', 'routes/interviews.js', "'/:id/event'"],
  ['int', 'POST /api/interviews/:id/complete', 'routes/interviews.js', "'/:id/complete'"],
  ['int', 'GET /api/interviews/:id/report', 'routes/interviews.js', "'/:id/report'"],
  ['code', 'GET /api/assessments/:id', 'routes/assessments.js', "'/:id'"],
  ['code', 'POST /api/assessments/:id/run', 'routes/assessments.js', "'/:id/run'"],
  ['code', 'POST /api/assessments/:id/submit', 'routes/assessments.js', "'/:id/submit'"],
  ['code', 'GET /api/submissions/:id', 'routes/assessments.js', "'/submissions/:id'"],
  ['ai', 'POST /api/ai/resume-analyze', 'routes/ai.js', "'/resume-analyze'"],
  ['ai', 'POST /api/ai/job-analyze', 'routes/ai.js', "'/job-analyze'"],
  ['ai', 'POST /api/ai/interview/question', 'routes/ai.js', "'/interview/question'"],
  ['ai', 'POST /api/ai/interview/evaluate', 'routes/ai.js', "'/interview/evaluate'"],
  ['ai', 'POST /api/ai/feedback', 'routes/ai.js', "'/feedback'"],
];
let missing = 0;
for (const [group, label, file, needle] of required) {
  const src = fs.readFileSync(path.join(server, file), 'utf8');
  const ok = src.includes(needle);
  if (!ok) { out.push(`  MISSING: [${group}] ${label}`); missing++; }
}
out.push(missing === 0 ? `  OK: all ${required.length} PRD endpoints present` : `  ${missing} missing of ${required.length}`);

out.push('');
out.push('===== CLIENT ROUTES DECLARED (vs PRD 68) =====');
const app = fs.readFileSync(path.join(clientSrc, 'App.jsx'), 'utf8');
[...app.matchAll(/<Route\s+path="([^"]+)"/g)].forEach((m) => out.push(`  ${m[1]}`));

fs.writeFileSync('d:/verify-report.txt', out.join('\n'));
console.log('written');
