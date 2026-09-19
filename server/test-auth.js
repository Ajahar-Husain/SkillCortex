const BASE = `http://localhost:${process.env.PORT || 5000}/api/auth`;
const ts = Date.now();
const post = async (path, body, token) => {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
  return { status: res.status, data };
};
const get = async (path, token) => {
  const res = await fetch(BASE + path, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
  return { status: res.status, data };
};

(async () => {
  const log = (name, r) => console.log(`${r.status < 400 ? 'PASS' : 'FAIL'} ${name}: status=${r.status} ${JSON.stringify(r.data).slice(0, 200)}`);

  console.log('== REGISTER CANDIDATE ==');
  const cEmail = `cand${ts}@test.com`;
  const reg = await post('/register', { name: 'Test Cand', email: cEmail, password: 'secret123', role: 'candidate' });
  log('register candidate', reg);
  const cToken = reg.data?.token;

  console.log('== REGISTER HR ==');
  const hEmail = `hr${ts}@test.com`;
  const regHr = await post('/register', { name: 'Test HR', email: hEmail, password: 'secret123', role: 'hr', company: 'Acme' });
  log('register hr', regHr);

  console.log('== LOGIN ==');
  const login = await post('/login', { email: cEmail, password: 'secret123' });
  log('login candidate', login);
  const loginHr = await post('/login', { email: hEmail, password: 'secret123' });
  log('login hr', loginHr);

  console.log('== LOGIN WRONG PASSWORD ==');
  const bad = await post('/login', { email: cEmail, password: 'wrong' });
  log('login wrong pw (expect 400)', bad);

  console.log('== /ME with token ==');
  const me = await get('/me', cToken);
  log('me candidate', me);
  const meHr = await get('/me', loginHr.data?.token);
  log('me hr', meHr);

  console.log('== RE-LOGIN (double-hash check) ==');
  const relogin = await post('/login', { email: cEmail, password: 'secret123' });
  log('re-login candidate', relogin);

  console.log('== DUPLICATE REGISTER (expect 400) ==');
  const dup = await post('/register', { name: 'Dup', email: cEmail, password: 'secret123', role: 'candidate' });
  log('duplicate register', dup);
})().catch((e) => { console.error('SCRIPT ERROR:', e.message); process.exit(1); });
