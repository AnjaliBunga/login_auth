const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email config error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

async function sendVerificationCodeEmail({ to, code }) {
  try {
    await transporter.sendMail({
      from: `"Login Auth" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Verification Code",
      text: `Your verification code is ${code}.`,
    });
    console.log(`✅ Verification code sent to ${to}`);
  } catch (err) {
    console.error(`⚠️ Failed to send verification email to ${to}:`, err.message);
    console.log(`[DEV LOG] Verification code for ${to}: ${code}`);
    console.log(`[INFO] You can use this code for manual verification during testing.`);
  }
}

module.exports = { sendVerificationCodeEmail };
