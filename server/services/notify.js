import Notification from '../models/Notification.js';

const prettyStatus = (s) =>
  ({ APPLIED: 'Application received', ASSESSMENT_STARTED: 'Assessment started', ASSESSMENT_COMPLETED: 'Assessment completed', UNDER_REVIEW: 'Under review', SHORTLISTED: 'Shortlisted', REJECTED: 'Not selected', HIRED: 'Hired' }[s] || s);

export async function notify({ toUserId, toEmail, type, subject, body, data }) {
  try {
    await Notification.create({ toUserId, toEmail, type, subject, body, data, sent: true });
  } catch (e) {
    console.error('[notify] failed:', e.message);
  }
  // SMTP hook: if SMTP env present, attempt real email (best effort, no hard dep)
  if (process.env.SMTP_HOST && toEmail) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      });
      await transporter.sendMail({ from: process.env.SMTP_FROM || 'SkillCortex <no-reply@skillcortex.com>', to: toEmail, subject, text: body, html: `<p>${String(body).replace(/\n/g, '<br/>')}</p>` });
    } catch (e) {
      console.error('[notify] smtp failed:', e.message);
    }
  }
}

export { prettyStatus };
