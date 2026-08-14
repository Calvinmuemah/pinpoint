const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

const initializeTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

initializeTransporter();

/**
 * Sends welcome and credential email to newly onboarded client.
 */
const sendClientWelcomeEmail = async ({ to, name, password, loginUrl }) => {
  const portalUrl = loginUrl || process.env.FRONTEND_URL || 'https://pinpoint-leads.vercel.app/login';
  const fromEmail = process.env.EMAIL_FROM || '"PinPoint Team" <welcome@pinpoint.io>';

  const subject = 'Welcome to PinPoint — Your Account Credentials';
  const textContent = `
Hello ${name},

Welcome to PinPoint! Your tour agency account has been created by our team.

Here are your login credentials:
Portal URL: ${portalUrl}
Email: ${to}
Temporary Password: ${password}

Please log in and update your password and travel keyword settings.

Best regards,
The PinPoint Team
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
    .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 540px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .logo { font-size: 24px; font-weight: 700; color: #0284c7; margin-bottom: 20px; }
    .credentials-box { background-color: #f1f5f9; border-radius: 6px; padding: 16px; margin: 24px 0; border-left: 4px solid #0284c7; }
    .credential-row { margin: 8px 0; font-size: 14px; }
    .label { font-weight: 600; color: #475569; }
    .value { font-family: monospace; font-size: 15px; color: #0f172a; font-weight: bold; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">📍 PinPoint</div>
    <h2>Welcome to PinPoint, ${name}!</h2>
    <p>Your agency account is now active. You can start receiving AI-intercepted high-intent travel leads directly in your dashboard.</p>
    
    <div class="credentials-box">
      <div class="credential-row"><span class="label">Login Email:</span> <span class="value">${to}</span></div>
      <div class="credential-row"><span class="label">Temporary Password:</span> <span class="value">${password}</span></div>
      <div class="credential-row"><span class="label">Portal URL:</span> <a href="${portalUrl}" style="color: #0284c7;">${portalUrl}</a></div>
    </div>

    <a href="${portalUrl}" class="btn">Log In to Your Dashboard</a>

    <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
      For security reasons, we recommend changing your password once you log in.
    </p>

    <div class="footer">
      &copy; 2026 PinPoint Intelligence Inc. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✅ [Email Service] Welcome email dispatched to ${to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [Email Service] Failed to send email to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Development / Demo Fallback logger
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 [Email Service (Mock / Dev Mode)]: Welcome Email Triggered');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Login URL: ${portalUrl}`);
    console.log(`   Temporary Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: true, mode: 'mock' };
  }
};

module.exports = {
  sendClientWelcomeEmail,
};
