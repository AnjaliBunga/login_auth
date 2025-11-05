const { Resend } = require('resend');

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationCodeEmail({ to, code }) {
    try {
        const subject = 'Your Verification Code';
        const html = `
            <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">${code}</p>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `;

        // Send the email via Resend API
        const response = await resend.emails.send({
            from: process.env.MAIL_FROM || 'Your App <onboarding@resend.dev>',
            to: to.trim(),
            subject,
            html,
        });

        console.log('✅ Email sent successfully:', response);
    } catch (error) {
        console.error('✗ Failed to send email:', error.message);
        throw error;
    }
}

module.exports = { sendVerificationCodeEmail };
