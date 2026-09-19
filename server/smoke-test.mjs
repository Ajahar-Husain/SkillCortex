// End-to-end smoke test for the PRD "Definition of Done" loop (PRD §91).
// Usage: node smoke-test.mjs   (API must be running on the configured PORT)
const BASE = process.env.BASE || 'http://localhost:5000';

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
};

async function call(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

const stamp = Date.now();
const candEmail = `smoke_cand_${stamp}@example.com`;
const hrEmail = `smoke_hr_${stamp}@example.com`;

console.log('\n== SkillCortex PRD smoke test ==\n' + BASE + '\n');

// ---------- 1. Health ----------
const health = await call('GET', '/api/health');
ok('GET /api/health', health.status === 200 && health.data.status === 'ok');

// ---------- 2. Auth: register + login (PRD §38/§47) ----------
const candReg = await call('POST', '/api/auth/register', {
  body: { name: 'Smoke Candidate', email: candEmail, password: 'Passw0rd!', role: 'candidate' },
});
ok('POST /api/auth/register (candidate)', candReg.status < 300 && !!candReg.data.token, JSON.stringify(candReg.data).slice(0, 200));
const candToken = candReg.data.token;

const hrReg = await call('POST', '/api/auth/register', {
  body: { name: 'Smoke HR', email: hrEmail, password: 'Passw0rd!', role: 'hr', company: 'SmokeCo' },
});
ok('POST /api/auth/register (hr)', hrReg.status < 300 && !!hrReg.data.token, JSON.stringify(hrReg.data).slice(0, 200));
const hrToken = hrReg.data.token;

const login = await call('POST', '/api/auth/login', { body: { email: candEmail, password: 'Passw0rd!' } });
ok('POST /api/auth/login', login.status === 200 && !!login.data.token);

const me = await call('GET', '/api/auth/me', { token: candToken });
ok('GET /api/auth/me', me.status === 200 && me.data.email === candEmail);

// ---------- 3. OTP verification (PRD §39) ----------
const emailOtp = await call('POST', '/api/auth/send-email-otp', { token: candToken, body: {} });
ok('POST /api/auth/send-email-otp', emailOtp.status === 200 && !!emailOtp.data.devCode, JSON.stringify(emailOtp.data));

const emailVerify = await call('POST', '/api/auth/verify-email-otp', { token: candToken, body: { code: emailOtp.data.devCode } });
ok('POST /api/auth/verify-email-otp', emailVerify.status === 200, JSON.stringify(emailVerify.data));

const mobileOtp = await call('POST', '/api/auth/send-mobile-otp', { token: candToken, body: { mobile: '+15550001111' } });
ok('POST /api/auth/send-mobile-otp', mobileOtp.status === 200 && !!mobileOtp.data.devCode, JSON.stringify(mobileOtp.data));

const mobileVerify = await call('POST', '/api/auth/verify-mobile-otp', { token: candToken, body: { code: mobileOtp.data.devCode } });
ok('POST /api/auth/verify-mobile-otp', mobileVerify.status === 200, JSON.stringify(mobileVerify.data));

