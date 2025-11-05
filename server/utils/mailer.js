const nodemailer = require('nodemailer');

function canUseSmtp() {
    return Boolean(process.env.SMTP_USER && (process.env.SMTP_HOST || process.env.SMTP_SERVICE));
}

function createTransporter() {
    const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
    const service = (process.env.SMTP_SERVICE || '').trim().toLowerCase();
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (service === 'gmail' || host === 'smtp.gmail.com') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: user ? { user, pass } : undefined,
        tls: {
            rejectUnauthorized: false
        }
    });
}

async function sendVerificationCodeEmail({ to, code }) {
    const subject = 'Your verification code';
    const text = `Your verification code is: ${code}\nThis code will expire in 10 minutes.`;
    const html = `<p>Your verification code is:</p><p style="font-size:20px;font-weight:bold;letter-spacing:3px">${code}</p><p>This code will expire in 10 minutes.</p>`;

    if (!canUseSmtp()) {
        console.log(`[DEV] SMTP not configured. Would send to ${to}: ${code}`);
        return;
    }

    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
    
    // Add timeout to fail faster (5 seconds)
    const sendPromise = transporter.sendMail({ from, to, subject, text, html });
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout after 5 seconds')), 5000)
    );
    
    await Promise.race([sendPromise, timeoutPromise]);
}

module.exports = { sendVerificationCodeEmail };


