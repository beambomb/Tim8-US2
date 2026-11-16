import nodemailer from 'nodemailer';

let cachedTransporter = null;
let cachedConfigKey = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resolve free/standard SMTP configuration from environment variables.
 * Supports any SMTP provider (Brevo free tier, Mailtrap, Resend SMTP, or Gmail App Password).
 */
export function getEmailConfig() {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  const host = (
    process.env.SMTP_HOST ||
    (process.env.GMAIL_USER ? 'smtp.gmail.com' : '')
  ).trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;
  const from = (process.env.SMTP_FROM || user || 'noreply@carikos.local').trim();

  return { host, port, secure, user, pass, from };
}

export function isEmailConfigured() {
  const { host, user, pass } = getEmailConfig();
  return Boolean(host && user && pass);
}

export function resetEmailTransporter() {
  cachedTransporter = null;
  cachedConfigKey = null;
}

function getTransporter(config) {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}`;
  if (cachedTransporter && cachedConfigKey === key) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
  cachedConfigKey = key;
  return cachedTransporter;
}

/**
 * Send a transactional notification email via configured SMTP transport.
 * Skips cleanly when SMTP credentials are not configured.
 */
export async function sendNotificationEmail({
  to,
  recipientName = '',
  judul,
  pesan,
  tipe = 'SYSTEM',
}) {
  if (!to || !isEmailConfigured()) {
    return { sent: false, skipped: true };
  }

  const config = getEmailConfig();
  const transporter = getTransporter(config);
  const greeting = recipientName ? `Halo ${recipientName},` : 'Halo,';
  const subject = `[CariKos] ${judul}`;
  const text = `${greeting}\n\n${pesan}\n\n--\nCariKos`;
  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #E2E8F0;border-radius:12px;color:#0F172A;background:#FFFFFF;">
      <p style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#1D4ED8;margin:0 0 8px;">CariKos • ${escapeHtml(tipe)}</p>
      <h2 style="font-size:18px;margin:0 0 12px;color:#0F172A;">${escapeHtml(judul)}</h2>
      <p style="font-size:14px;line-height:1.6;margin:0 0 12px;color:#334155;">${escapeHtml(greeting)}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#334155;">${escapeHtml(pesan)}</p>
      <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;" />
      <p style="font-size:12px;color:#64748B;margin:0;">Email ini dikirim otomatis oleh sistem notifikasi CariKos.</p>
    </div>
  `.trim();

  const info = await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, messageId: info?.messageId || null };
}
