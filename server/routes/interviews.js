import express from 'express';
import { auth } from '../middleware/auth.js';
import CandidateReview from '../models/CandidateReview.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import CodeSubmission from '../models/CodeSubmission.js';
import CodingAssessment from '../models/CodingAssessment.js';
import { geminiText, geminiJSON } from '../services/gemini.js';
import { matchSkills, extractSkillsFromText, recommendationFor, finalRecommendationFor } from '../services/matching.js';
import { awardPoints } from '../services/gamify.js';
import { notify } from '../services/notify.js';

const router = express.Router();

// PRD §24 — Integrity Score.
// Deterministic, server-owned penalty model so the same event stream always
// yields the same score (no AI involvement in compliance scoring).
export function integritySummaryFor(interview) {
  const events = interview.integrityEvents || [];
  const counts = {};
  events.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1; });
  // Single source of truth: reuse the identical capped weighted model used by the
  // live event endpoint so the persisted report score always matches what the
  // candidate saw in-session (PRD 24 / 65).
  const { score } = computeIntegrity(events);
  return {
    score,
    tabSwitches: counts.TAB_SWITCH || 0,
    fullscreenExits: counts.FULLSCREEN_EXIT || 0,
    copyPaste: counts.COPY_PASTE || 0,
    devtools: counts.DEVTOOLS_OPEN || 0,
    totalEvents: events.length,
    counts,
    level: score >= 90 ? 'CLEAN' : score >= 70 ? 'MINOR_CONCERNS' : score >= 45 ? 'SUSPICIOUS' : 'HIGH_RISK',
    events,
  };
}


// PRD §24 / §23 — Integrity Events. Weighted penalty model.
// Weights are deliberately non-destructive: integrity is a *supporting* dimension
// (PRD §65) and must never be used as an automatic black-box rejection.
const INTEGRITY_WEIGHTS = {
  TAB_SWITCH: 8,
  FULLSCREEN_EXIT: 5,
  WINDOW_BLUR: 3,
  COPY_PASTE: 4,
  RIGHT_CLICK: 1,
  DEVTOOLS_OPEN: 12,
  MULTIPLE_FACES: 10,
  NO_FACE: 6,
  AUDIO_ANOMALY: 4,
  CAMERA_INTERRUPTED: 5,
  PERMISSION_DENIED: 2,
  EXTENSION_DETECTED: 15,
  NETWORK_DISCONNECT: 2,
  TIME_ANOMALY: 20,
};

export function computeIntegrity(events = []) {
  const counts = {};
  const penaltyByType = {};
  for (const e of events) {
    const type = String(e?.type || 'UNKNOWN').toUpperCase();
    counts[type] = (counts[type] || 0) + 1;
    const weight = INTEGRITY_WEIGHTS[type] ?? 2;
    // Cap repeats of the same category so one noisy signal cannot zero the score
    // (PRD §61/§65 — integrity supports, it never auto-rejects).
    penaltyByType[type] = Math.min((penaltyByType[type] || 0) + weight, weight * 4);
  }
  const penalty = Object.values(penaltyByType).reduce((a, b) => a + b, 0);
  return { score: Math.max(0, Math.round(100 - penalty)), counts, penalty, total: events.length };
}

// PRD §65 — Interview Scoring Model. Recruiters can configure weights.
const DEFAULT_WEIGHTS = {
  technical: 0.30,
  problemSolving: 0.20,
  coding: 0.25,
  communication: 0.10,
  jobMatch: 0.10,
  integrity: 0.05,
};

export function computeOverallScore(dims = {}, weights = DEFAULT_WEIGHTS) {
  const w = { ...DEFAULT_WEIGHTS, ...(weights || {}) };
  const val = (v, fallback) => (typeof v === 'number' && !Number.isNaN(v) ? v : fallback);
  const total =
    val(dims.technical, 60) * w.technical +
    val(dims.problemSolving, 60) * w.problemSolving +
    val(dims.coding, 60) * w.coding +
    val(dims.communication, 60) * w.communication +
    val(dims.jobMatch, 70) * w.jobMatch +
    val(dims.integrity, 100) * w.integrity;
  return Math.max(0, Math.min(100, Math.round(total)));
}

// Simple chat-style generation (used by InterviewSession UI)
router.post('/generate', auth, async (req, res) => {
  try {
    const { resume, jobRole, jobRequirements, previousMessages } = req.body;
    const reqs = Array.isArray(jobRequirements) ? jobRequirements.join(', ') : (jobRequirements || 'general');
    let history = 'System: You are AJ Assistant, expert interviewer. Role=' + jobRole + ' Reqs=' + reqs + ' Resume=' + String(resume || '').slice(0, 2500) + '\n';
    (previousMessages || []).forEach((m) => { history += (m.role === 'user' ? 'Candidate' : 'AJ') + ': ' + m.content + '\n'; });
    history += 'AJ (next question):';
    const text = await geminiText(history, { fallback: 'Tell me about a challenging technical problem you solved recently.' });
    res.json({ text });
  } catch (e) {
    res.status(500).json({ message: 'Failed to generate AI response', error: e.message });
  }
});

// PRD §47 / §68 — interview history for the signed-in candidate, or for HR
// scoped to the jobs they own.
router.get('/', auth, async (req, res) => {
  try {
    const { status, jobId, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (req.user.role === 'hr' || req.user.role === 'admin') {
      const jobs = await Job.find({ $or: [{ hrRef: req.user.userId }, { postedBy: req.user.userId }] }).select('_id');
      filter.jobId = jobId || { $in: jobs.map((j) => j._id) };
    } else {
      filter.candidateId = req.user.userId;
      if (jobId) filter.jobId = jobId;
    }
    if (status) filter.status = status;
    const lim = Math.min(100, Math.max(1, parseInt(limit)));
    const pg = Math.max(1, parseInt(page));
    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate('jobId', 'title company location')
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lim)
        .limit(lim),
      Interview.countDocuments(filter),
    ]);
    res.json({ interviews, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load interviews' });
  }
});

// PRD: POST /api/interviews/start
router.post('/start', auth, async (req, res) => {
  try {
    const { jobId, applicationId, resumeText } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const cfg = job.interviewConfig || {};
    const durationMin = cfg.durationMin || 10;
    const sessionId = 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // PRD §65 "Job Skill Match" dimension — reuse the application's match score when
    // the candidate applied first, otherwise derive it from the supplied resume text.
    let resumeMatchScore = null;
    if (applicationId) {
      const app = await Application.findById(applicationId).select('matchScore');
      if (app?.matchScore != null) resumeMatchScore = app.matchScore;
    }
    if (resumeMatchScore == null && resumeText) {
      const jobSkills = [...(job.skills || []), ...(job.requirements || [])];
      resumeMatchScore = matchSkills(extractSkillsFromText(resumeText), jobSkills).matchScore;
    }

    // PRD §20 / §62 — reconnection: resume an in-flight session instead of
    // spawning a duplicate interview for the same application.
    if (applicationId) {
      const existing = await Interview.findOne({
        applicationId,
        status: { $in: ['STARTED', 'QUESTIONING', 'CODING_TASK', 'FINAL_QUESTION', 'DISCONNECTED', 'PAUSED'] },
      }).populate('jobId', 'title');
      if (existing) {
        if (existing.status === 'DISCONNECTED' || existing.status === 'PAUSED') existing.status = 'QUESTIONING';
        await existing.save();
        return res.json({
          resumed: true,
          sessionId: existing.sessionId,
          interviewId: existing._id,
          deadline: existing.serverDeadlineAt,
          durationMin: existing.durationMin,
          questions: existing.questions,
          transcript: existing.transcript,
          firstQuestion: existing.questions[existing.questions.length - 1] || '',
          remainingSec: Math.max(0, Math.round((new Date(existing.serverDeadlineAt).getTime() - Date.now()) / 1000)),
        });
      }
    }

    const interview = await Interview.create({
      jobId, candidateId: req.user.userId, applicationId,
      sessionId, durationMin,
      difficulty: cfg.difficulty || 'Intermediate',
      numQuestions: cfg.numQuestions || 8,
      resumeMatchScore,
      scoringWeights: cfg.weights || cfg.scoringWeights || undefined,
      startedAt: new Date(),
      serverDeadlineAt: new Date(Date.now() + durationMin * 60 * 1000),
      status: 'STARTED',
      transcript: [{ role: 'system', content: 'Interview started for ' + job.title }]
    });
    if (applicationId) await Application.findByIdAndUpdate(applicationId, { status: 'ASSESSMENT_STARTED', interviewId: interview._id });
    const firstQ = await geminiText('You are AJ Interviewer for role ' + job.title + '. Ask the first question only.', { fallback: 'Introduce yourself and describe your strongest skill for this role.' });
    interview.questions.push(firstQ);
    interview.transcript.push({ role: 'assistant', content: firstQ });
    interview.status = 'QUESTIONING';
    await interview.save();
    res.status(201).json({ resumed: false, sessionId, interviewId: interview._id, deadline: interview.serverDeadlineAt, firstQuestion: firstQ, durationMin, resumeMatchScore, questions: interview.questions });
  } catch (e) {
    res.status(500).json({ message: 'Failed to start interview' });
  }
});

// PRD: POST /api/interviews/:id/answer
router.post('/:id/answer', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('jobId');
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    // PRD §63 — the backend owns authoritative timestamps, so answers submitted
    // after the server deadline are refused regardless of the client clock.
    const remainingSec = interview.serverDeadlineAt ? Math.round((new Date(interview.serverDeadlineAt).getTime() - Date.now()) / 1000) : null;
    if (remainingSec !== null && remainingSec <= 0) {
      interview.status = 'SUBMITTING';
      await interview.save();
      return res.status(409).json({ message: 'Interview time has expired', remainingSec: 0, expired: true });
    }
    const { answer } = req.body;
    const lastQ = interview.questions[interview.questions.length - 1] || 'General question';
    // PRD §25 — AI Answer Evaluation scores five dimensions, and PRD §26 requires
    // the model to justify the score with concepts actually present in the answer
    // instead of inventing an unverifiable verdict.
    const ev = await geminiJSON(
      'You are an impartial technical interviewer evaluating one answer.\n' +
      'Return ONLY JSON: {"score":0-5,"feedback":"2-3 sentences","dimensions":{"correctness":0-5,"relevance":0-5,"depth":0-5,"clarity":0-5,"confidence":0-5},' +
      '"coveredConcepts":["concept from the answer"],"missedConcepts":["expected concept not covered"],"improvement":"one actionable tip"}\n' +
      'Rules: base every field strictly on the candidate text; if the answer is empty or off-topic score 0-1 and list the concepts as missed.\n' +
      'Question: ' + lastQ + '\nCandidate answer: ' + String(answer || '').slice(0, 4000),
      { score: 3, feedback: 'Recorded.', dimensions: { correctness: 3, relevance: 3, depth: 3, clarity: 3, confidence: 3 }, coveredConcepts: [], missedConcepts: [], improvement: 'Add a concrete example.' }
    );
    interview.answers.push({
      question: lastQ,
      answer,
      score: ev.score,
      feedback: ev.feedback,
      dimensions: ev.dimensions,
      evidence: {
        coveredConcepts: ev.coveredConcepts || [],
        missedConcepts: ev.missedConcepts || [],
        improvement: ev.improvement,
      },
      at: new Date(),
    });
    interview.transcript.push({ role: 'user', content: answer });
    // PRD §64 — Question Adaptation Algorithm: difficulty follows the running score.
    // Takes the running average rather than only the last answer so one lucky or
    // unlucky answer cannot swing the whole interview.
    const scored = interview.answers.filter((a) => typeof a.score === 'number');
    const runningAvg = scored.length ? scored.reduce((sum, a) => sum + a.score, 0) / scored.length : ev.score;
    const level = runningAvg >= 3.8 ? 'harder' : runningAvg <= 2.2 ? 'easier follow-up' : 'same-level next';
    const weakAreas = [...new Set(interview.answers.flatMap((a) => a.evidence?.missedConcepts || []))].slice(0, 5);
    const nextQ = await geminiText(
      'You are AJ Interviewer for the role: ' + interview.jobId.title + '.\n' +
      'Candidate running average score: ' + runningAvg.toFixed(2) + '/5.\n' +
      (weakAreas.length ? 'Concepts they missed so far (probe one of these): ' + weakAreas.join(', ') + '\n' : '') +
      'Ask exactly one ' + level + ' question. Reply with the question text only.',
      { fallback: 'Can you go deeper with a concrete example?' }
    );
    interview.questions.push(nextQ);
    interview.transcript.push({ role: 'assistant', content: nextQ });
    await interview.save();
    res.json({ evaluation: ev, nextQuestion: nextQ, count: interview.questions.length });
  } catch (e) {
    res.status(500).json({ message: 'Failed to record answer' });
  }
});

// PRD: POST /api/interviews/:id/complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('jobId');
    if (!interview) return res.status(404).json({ message: 'Not found' });
    const codingSubs = await CodeSubmission.find({ interviewId: interview._id });
    const codingScore = codingSubs.length ? Math.round(codingSubs.reduce((a, s) => a + (s.score || 0), 0) / codingSubs.length) : null;
    const tText = interview.transcript.filter((t) => t.role !== 'system').map((t) => (t.role === 'user' ? 'Candidate' : 'AI') + ': ' + t.content).join('\n').slice(0, 8000);
    const analysis = await geminiJSON('Analyze transcript JSON {score0to5, feedback, strengths, weaknesses, technicalScore, communicationScore, problemSolvingScore}. Transcript:\n' + tText, { score0to5: 3, feedback: 'Completed.', strengths: [], weaknesses: [], technicalScore: 60, communicationScore: 60, problemSolvingScore: 60 });
    const integrity = integritySummaryFor(interview);
    const integrityScore = integrity.score;
    // PRD §65 — Interview Scoring Model: Technical 30, Problem Solving 20, Coding 25,
    // Communication 10, Job Skill Match 10, Integrity 5. Recruiters may override the
    // weights per job, so we honour interview.scoringWeights when it was configured.
    const overall = computeOverallScore(
      {
        technical: analysis.technicalScore,
        problemSolving: analysis.problemSolvingScore,
        coding: codingScore,
        communication: analysis.communicationScore,
        jobMatch: interview.resumeMatchScore,
        integrity: integrityScore,
      },
      interview.scoringWeights
    );
    const recommendation = recommendationFor(overall);
    // PRD §66 — Final Candidate Recommendation (band + confidence + reason + HR action).
    const final = finalRecommendationFor({
      overall,
      integrityScore,
      answeredQuestions: (interview.answers || []).length,
      codingPassed: codingSubs.length ? codingSubs[0].passed : null,
      codingTotal: codingSubs.length ? codingSubs[0].total : null,
    });
    Object.assign(interview, { technicalScore: analysis.technicalScore, communicationScore: analysis.communicationScore, problemSolvingScore: analysis.problemSolvingScore, codingScore, integrityScore, overallScore: overall, recommendation, recommendationReason: analysis.feedback, completedAt: new Date(), status: 'COMPLETED' });
    await interview.save();
    const user = await User.findById(interview.candidateId);
    const hrId = interview.jobId.postedBy || interview.jobId.hrRef;
    const review = await CandidateReview.create({
      jobId: interview.jobId._id, jobTitle: interview.jobId.title, hrId,
      candidateId: interview.candidateId, candidateName: user?.name || 'Candidate',
      interviewId: interview._id, applicationId: interview.applicationId,
      aiScore: analysis.score0to5 ?? 3, aiScore100: overall, aiFeedback: analysis.feedback,
      strengths: analysis.strengths, weaknesses: analysis.weaknesses,
      integritySummary: {
        tabSwitches: integrity.tabSwitches,
        fullscreenExits: integrity.fullscreenExits,
        copyPaste: integrity.copyPaste,
        devtools: integrity.devtools,
        totalEvents: integrity.totalEvents,
        level: integrity.level,
        score: integrityScore,
      },
      technicalScore: analysis.technicalScore, communicationScore: analysis.communicationScore, problemSolvingScore: analysis.problemSolvingScore,
      // PRD §26 — per-question evidence trail surfaced on the result page.
      questionEvidence: (interview.answers || []).map((a) => ({
        question: a.question,
        answer: a.answer,
        score: a.score,
        review: a.feedback,
        dimensions: a.dimensions,
        coveredConcepts: a.evidence?.coveredConcepts || [],
        missedConcepts: a.evidence?.missedConcepts || [],
        improvement: a.evidence?.improvement,
      })),
      codingResult: codingSubs.length
        ? { passed: codingSubs[0].passed, total: codingSubs[0].total, score: codingScore, language: codingSubs[0].language, submissionId: codingSubs[0]._id }
        : null,
      recommendation,
      recommendationReason: final.reason,
      finalRecommendation: final.overall,
      finalConfidence: final.confidence,
      hrAction: final.hrAction,
      transcript: interview.transcript
    });
    // PRD §24 — a low integrity score is a hard compliance gate: the candidate is
    // reported to the recruiter but must never be auto-forwarded as qualified.
    // PRD §65 — integrity signals stay a *supporting* dimension, and PRD §61 forbids
    // black-box automatic rejection. A weak integrity score therefore escalates the
    // candidate to mandatory human review, with the evidence attached, instead of
    // deciding for the recruiter.
    if (integrityScore < 50) {
      review.flaggedForHumanReview = true;
      review.hrDecision = 'UNDER_REVIEW';
      review.finalRecommendation = 'REVIEW';
      review.hrAction = 'Mandatory human review of integrity events before any decision.';
      review.finalConfidence = Math.min(review.finalConfidence || 50, 40);
      review.recommendationReason = `${review.recommendationReason} Integrity analysis flagged this session (score ${integrityScore}, level ${integrity.level}); the raw events are attached for human inspection (PRD §24).`;
      await review.save();
    }
    interview.status = 'REPORTED';
    await interview.save();
    if (interview.applicationId) await Application.findByIdAndUpdate(interview.applicationId, { status: 'ASSESSMENT_COMPLETED', interviewId: interview._id });
    await notify({
      toUserId: hrId,
      type: 'ASSESSMENT_COMPLETED',
      subject: 'Assessment complete: ' + (user?.name || 'Candidate'),
      body: `${user?.name || 'Candidate'} scored ${overall}/100 (${recommendation}) for ${interview.jobId.title}.`,
      data: { reviewId: String(review._id), interviewId: String(interview._id), link: '/hr/candidates/' + review._id },
    });
    await awardPoints(interview.candidateId, { points: 100, coins: 100 });
    res.json({
      message: 'Evaluation complete',
      reviewId: review._id,
      interviewId: interview._id,
      overall,
      recommendation,
      finalRecommendation: final,
      integrity: { score: integrityScore, level: integrity.level, events: integrity.events },
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to complete interview' });
  }
});

// PRD §21/§31/§83 — provision the coding task for an interview that requires one.
// Idempotent: re-calling returns the existing assessment instead of a new task.
router.post('/:id/coding-task', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('jobId');
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    const job = interview.jobId;
    if (!job?.codingConfig?.required) {
      return res.status(400).json({ message: 'Coding is not required for this role' });
    }
    // Already provisioned → return it (safe re-entry / refresh).
    if (interview.codingAssessmentId) {
      const existing = await CodingAssessment.findById(interview.codingAssessmentId);
      if (existing) return res.json({ assessment: existing, existing: true });
    }
    const difficulty = job.interviewConfig?.difficulty || 'Intermediate';
    // PRD §26 — the generated task must be mechanically verifiable, so the AI
    // is forced to emit concrete JSON test cases instead of prose-only tasks.
    const task = await geminiJSON(
      'Generate ONE JavaScript coding task for a ' + job.title + ' interview (difficulty ' + difficulty + ').\n' +
      'Return ONLY JSON: {"title":"short title","description":"problem statement with input/output examples",\n' +
      '"starterCode":"function solution(input) {\\n  // your code here\\n}","testCases":[{"input":<JSON value>,"expected":<JSON value>,"hidden":false,"description":"example"}, ...]}\n' +
      'Rules: exactly 4 test cases (2 visible, 2 hidden). Inputs/outputs must be JSON-serializable\n' +
      '(numbers, strings, arrays, plain objects). The solution function receives ONE `input` argument and returns the output.\n' +
      'Skill focus: ' + ((job.skills || []).slice(0, 6).join(', ') || 'data structures and algorithms') + '.',
      {
        title: 'Array Sum Challenge',
        description: 'Write a function `solution(input)` that receives an array of numbers and returns their sum.',
        starterCode: 'function solution(input) {\n  // your code here\n}\n',
        testCases: [
          { input: [1, 2, 3], expected: 6, hidden: false, description: 'Simple list' },
          { input: [], expected: 0, hidden: false, description: 'Empty list' },
          { input: [-5, 10, 2], expected: 7, hidden: true },
          { input: [100, 200], expected: 300, hidden: true },
        ],
      }
    );
    const testCases = (Array.isArray(task.testCases) ? task.testCases : [])
      .filter((t) => t && 'input' in t && 'expected' in t)
      .slice(0, 6)
      .map((t) => ({ input: t.input, expected: t.expected, hidden: !!t.hidden, description: t.description || undefined }));
    const assessment = await CodingAssessment.create({
      jobId: job._id,
      interviewId: interview._id,
      title: task.title || 'Coding Challenge',
      description: task.description || '',
      language: 'javascript',
      starterCode: task.starterCode || 'function solution(input) {\n  // your code here\n}\n',
      testCases: testCases.length ? testCases : [
        { input: [1, 2, 3], expected: 6, hidden: false, description: 'Simple list' },
        { input: [], expected: 0, hidden: false, description: 'Empty list' },
      ],
      difficulty,
    });
    interview.codingAssessmentId = assessment._id;
    // PRD §19 — explicit state-machine transition into the coding phase.
    interview.status = 'CODING_TASK';
    await interview.save();
    res.status(201).json({ assessment, existing: false });
  } catch (e) {
    res.status(500).json({ message: 'Failed to provision coding task' });
  }
});

// Legacy evaluate (old UI posts jobId+transcript)
router.post('/evaluate', auth, async (req, res) => {
  try {
    const { jobId, transcript } = req.body;
    if (!jobId || !transcript?.length) return res.status(400).json({ message: 'Missing job ID or transcript' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const text = transcript.filter((m) => m.role !== 'system').map((m) => (m.role === 'user' ? 'Candidate' : 'AI') + ': ' + m.content).join('\n').slice(0, 8000);
    const data = await geminiJSON('Return JSON {score 0-5, feedback}. Transcript:\n' + text, { score: 3, feedback: 'Completed.' });
    const score100 = Math.round(((data.score || 3) / 5) * 100);
    const user = await User.findById(req.user.userId);
    const review = await CandidateReview.create({ jobId: job._id, jobTitle: job.title, hrId: job.postedBy || job.hrRef, candidateId: req.user.userId, candidateName: user?.name || 'Candidate', aiScore: data.score || 3, aiScore100: score100, aiFeedback: data.feedback, recommendation: recommendationFor(score100), transcript });
    await awardPoints(req.user.userId, { points: 100, coins: 100 });
    res.json({ message: 'Evaluation complete', reviewId: review._id });
  } catch (e) {
    res.status(500).json({ message: 'Failed to evaluate interview' });
  }
});

// PRD §62 — pre-flight reliability check (camera / mic / internet / speech)
// and §60 — consent capture before integrity monitoring or AI analysis.
router.post('/:id/ready', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    const { camera, microphone, internet, speechRecognition, consent } = req.body || {};
    const previous = interview.readiness || {};
    interview.readiness = {
      camera: !!camera,
      microphone: !!microphone,
      internet: !!internet,
      speechRecognition: !!speechRecognition,
      consent: consent === undefined ? !!previous.consent : !!consent,
      checkedAt: new Date(),
    };
    interview.status = 'READY_CHECK';
    await interview.save();
    // PRD §84 — degrade gracefully: missing devices are surfaced, never fatal.
    const missing = ['camera', 'microphone', 'internet'].filter((k) => !interview.readiness[k]);
    res.json({ readiness: interview.readiness, missing, degraded: missing.length > 0 });
  } catch (e) {
    res.status(500).json({ message: 'Failed to record readiness check' });
  }
});

// PRD §19 / §23 / §24 — integrity event ingestion with an evidence trail HR can inspect.
router.post('/:id/event', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    const { type, detail, durationSec, at } = req.body || {};
    if (!type) return res.status(400).json({ message: 'Event type is required' });
    const normalized = String(type).toUpperCase();
    interview.integrityEvents.push({
      type: normalized,
      detail: detail ? String(detail).slice(0, 500) : undefined,
      durationSec: typeof durationSec === 'number' ? durationSec : undefined,
      at: at ? new Date(at) : new Date(),
    });
    interview.lastHeartbeatAt = new Date();
    // PRD §65 — integrity stays a supporting signal, so we flag rather than reject.
    if (['DEVTOOLS_OPEN', 'EXTENSION_DETECTED', 'TIME_ANOMALY'].includes(normalized)) interview.integrityFlagged = true;
    await interview.save();
    const integrity = computeIntegrity(interview.integrityEvents);
    res.status(201).json({ recorded: normalized, integrity: { score: integrity.score, counts: integrity.counts } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to record integrity event' });
  }
});

// PRD §63 — server-authoritative timer. The client only *displays* this value.
router.get('/:id/timer', auth, async (req, res) => {
  const interview = await Interview.findById(req.params.id).select('startedAt serverDeadlineAt status durationMin');
  if (!interview) return res.status(404).json({ message: 'Interview not found' });
  const now = Date.now();
  const deadline = interview.serverDeadlineAt ? new Date(interview.serverDeadlineAt).getTime() : null;
  const remainingSec = deadline ? Math.max(0, Math.round((deadline - now) / 1000)) : null;
  res.json({
    serverTime: new Date(now),
    startedAt: interview.startedAt,
    deadline: interview.serverDeadlineAt,
    durationMin: interview.durationMin,
    remainingSec,
    expired: remainingSec === 0,
    status: interview.status,
  });
});

// PRD §20 / §62 — heartbeat keeps the session live and restores a dropped connection.
router.post('/:id/heartbeat', auth, async (req, res) => {
  const interview = await Interview.findById(req.params.id).select('status serverDeadlineAt startedAt');
  if (!interview) return res.status(404).json({ message: 'Interview not found' });
  interview.lastHeartbeatAt = new Date();
  if (interview.status === 'DISCONNECTED') interview.status = 'QUESTIONING';
  await interview.save();
  const remainingSec = interview.serverDeadlineAt ? Math.max(0, Math.round((new Date(interview.serverDeadlineAt).getTime() - Date.now()) / 1000)) : null;
  res.json({ status: interview.status, remainingSec, expired: remainingSec === 0 });
});

// PRD §19 — explicit interview state machine transitions.
router.patch('/:id/status', auth, async (req, res) => {
  const ALLOWED = ['CREATED', 'READY_CHECK', 'STARTED', 'QUESTIONING', 'CODING_TASK', 'FINAL_QUESTION', 'SUBMITTING', 'ANALYZING', 'COMPLETED', 'REPORTED', 'DISCONNECTED', 'PAUSED', 'FAILED', 'CANCELLED', 'FLAGGED'];
  const { status } = req.body || {};
  if (!ALLOWED.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ message: 'Interview not found' });
  interview.status = status;
  if (status === 'PAUSED') interview.pausedAt = new Date();
  await interview.save();
  res.json({ status: interview.status });
});

// PRD: GET /api/interviews/:id
router.get('/:id', auth, async (req, res) => {
  const interview = await Interview.findById(req.params.id).populate('jobId candidateId');
  if (!interview) return res.status(404).json({ message: 'Not found' });
  res.json(interview);
});

router.get('/:id/report', auth, async (req, res) => {
  const review = await CandidateReview.findOne({ interviewId: req.params.id });
  if (!review) return res.status(404).json({ message: 'Report not found' });
  res.json(review);
});

export default router;
