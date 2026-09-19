import { GoogleGenAI } from '@google/genai';

let ai = null;
function getClient() {
  if (ai) return ai;
  if (!process.env.GEMINI_API_KEY) return null;
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function cleanJson(text = '') {
  let t = String(text).trim();
  t = t.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return t;
}

export async function geminiText(prompt, { fallback = '' } = {}) {
  try {
    const client = getClient();
    if (!client) return fallback;
    const res = await client.models.generateContent({ model: MODEL, contents: prompt });
    return res.text || fallback;
  } catch (e) {
    console.error('[gemini] text error:', e.message);
    return fallback;
  }
}

export async function geminiJSON(prompt, fallbackValue = null) {
  const raw = await geminiText(prompt, { fallback: '' });
  if (!raw) return fallbackValue;
  try {
    return JSON.parse(cleanJson(raw));
  } catch (e) {
    console.error('[gemini] JSON parse failed:', String(raw).slice(0, 500));
    return fallbackValue;
  }
}

export { MODEL };
