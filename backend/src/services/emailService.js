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

function parseSender(rawFrom, fallbackName = 'CariKos') {
  const trimmed = String(rawFrom || '').trim();
  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].replace(/^["']|["']$/g, '').trim() || fallbackName,
      email: match[2].trim(),
    };
  }
  return { name: fallbackName, email: trimmed };
}

/**
 * Resolve email provider configuration from environment variables.
 * Prefers Brevo HTTPS API (works on hosts blocking SMTP ports like Hugging Face Spaces)
 * and falls back to standard SMTP (Brevo SMTP / Gmail App Password).
 */
export function getEmailConfig() {
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const brevoSender = (
    process.env.BREVO_SENDER_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    ''
  ).trim();
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

  return { brevoApiKey, brevoSender, host, port, secure, user, pass, from };
}

export function isEmailConfigured() {
  const { brevoApiKey, brevoSender, host, user, pass } = getEmailConfig();
  return Boolean((brevoApiKey && parseSender(brevoSender).email) || (host && user && pass));
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
 * Send a transactional notification email via Brevo HTTPS API or configured SMTP transport.
 * Skips cleanly when email credentials are not configured.
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

  if (config.brevoApiKey && parseSender(config.brevoSender).email) {
    const sender = parseSender(config.brevoSender);
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.brevoApiKey,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to, name: recipientName || to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    const result = await response.json().catch(() => ({}));
    return { sent: true, messageId: result?.messageId || null, provider: 'brevo-api' };
  }

  const transporter = getTransporter(config);
  const info = await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, messageId: info?.messageId || null, provider: 'smtp' };
}
