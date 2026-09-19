import fs from 'fs';

const BASE = `http://localhost:${process.env.PORT || 5000}`;

async function upload(name, bytes, type) {
  const fd = new FormData();
  fd.append('resume', new Blob([bytes], { type }), name);
  const res = await fetch(`${BASE}/api/upload/resume`, { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const pdf = fs.readFileSync('D:/SkillCortex/SkillCortex-PRD.pdf');
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 1, 2, 3]);

console.log('== REAL PDF ==');
const r1 = await upload('resume.pdf', pdf, 'application/pdf');
console.log(`status=${r1.status} len=${r1.data.text?.length} preview=${JSON.stringify((r1.data.text || '').slice(0, 100))}`);

console.log('== UNSUPPORTED PNG ==');
const r2 = await upload('image.png', png, 'image/png');
console.log(`status=${r2.status} message=${JSON.stringify(r2.data.message)}`);

console.log('== FAKE PDF (corrupt) ==');
const r3 = await upload('fake.pdf', Buffer.from('%PDF-1.4 garbage not a real pdf'), 'application/pdf');
console.log(`status=${r3.status} message=${JSON.stringify(r3.data.message)}`);

console.log('== TXT ==');
const r4 = await upload('resume.txt', Buffer.from('John Doe — Senior Engineer. Skills: React, Node.js, MongoDB, AWS.'), 'text/plain');
console.log(`status=${r4.status} text=${JSON.stringify(r4.data.text)}`);
