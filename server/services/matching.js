export function normalizeSkills(skills = []) {
  const seen = new Set();
  const out = [];
  for (const s of skills) {
    const k = String(s || '').trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(String(s).trim());
  }
  return out;
}

export function matchSkills(resumeSkills = [], jobSkills = []) {
  const r = new Set(resumeSkills.map((s) => String(s).toLowerCase().trim()));
  const matched = [];
  const missing = [];
  for (const j of jobSkills) {
    const k = String(j).toLowerCase().trim();
    if (r.has(k)) matched.push(j);
    else missing.push(j);
  }
  const pct = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  return { matched, missing, matchScore: pct };
}

const KNOWN = ['react', 'node.js', 'nodejs', 'node', 'express', 'mongodb', 'mongoose', 'javascript', 'typescript', 'python', 'java', 'spring boot', 'sql', 'postgresql', 'mysql', 'aws', 'docker', 'redis', 'html', 'css', 'tailwind', 'next.js', 'vue', 'angular', 'c++', 'c', 'git', 'rest', 'graphql', 'webrtc', 'socket.io', 'firebase', 'azure', 'gcp', 'linux', 'dsa'];

export function extractSkillsFromText(text = '') {
  const lower = String(text).toLowerCase();
  const found = [];
  for (const k of KNOWN) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^a-z0-9+#])${esc}([^a-z0-9+#]|$)`, 'i').test(lower)) {
      found.push(k === 'nodejs' ? 'Node.js' : k === 'node' ? 'Node.js' : k);
    }
  }
  return normalizeSkills(found);
}

export function recommendationFor(score100 = 0, codingScore = null) {
  if (score100 >= 90) return 'EXCEPTIONAL';
  if (score100 >= 80) return 'STRONG';
  if (score100 >= 65) return 'GOOD';
  if (score100 >= 45) return 'REVIEW';
  if (score100 >= 30) return 'WEAK';
  return 'NOT_RECOMMENDED';
}

// PRD §66 — Final Candidate Recommendation.
// Returns the overall band, a confidence figure, a human-readable reason and the
// recommended recruiter action. Confidence falls when the evidence is thin
// (few answered questions) or when integrity events cast doubt on the session.
export function finalRecommendationFor({
  overall = 0,
  integrityScore = 100,
  answeredQuestions = 0,
  codingPassed = null,
  codingTotal = null,
} = {}) {
  const band = recommendationFor(overall);

  const hrAction = {
    EXCEPTIONAL: 'Fast-track to the final round.',
    STRONG: 'Move to the next interview round.',
    GOOD: 'Proceed to a technical round with the hiring manager.',
    REVIEW: 'Manual recruiter review of the transcript before deciding.',
    WEAK: 'Hold — recommend additional screening or a re-attempt.',
    NOT_RECOMMENDED: 'Reject for this role; suggest upskilling resources.',
  }[band];

  // Confidence: 55% evidence volume, 30% integrity, 15% coding coverage.
  let confidence = 0;
  confidence += Math.min(1, answeredQuestions / 6) * 55;
  confidence += (integrityScore / 100) * 30;
  if (codingTotal) confidence += ((codingPassed ?? 0) / codingTotal) * 15;
  else confidence += 7.5; // neutral when the role has no coding task
  confidence = Math.round(Math.max(10, Math.min(99, confidence)));

  const codingLine = codingTotal
    ? ` Property-based coding checks passed ${codingPassed}/${codingTotal}.`
    : ' No coding task was configured for this role.';
  const integrityLine = integrityScore >= 90
    ? ' Session integrity was clean.'
    : ` Integrity score ${integrityScore}/100 means the session should be reviewed by a human.`;

  const reason = `Automated assessment placed the candidate in the ${band} band with an overall score of ${overall}/100 based on ${answeredQuestions} evaluated answer(s).${codingLine}${integrityLine}`;

  return { overall: band, overallScore: overall, confidence, reason, hrAction };
}

