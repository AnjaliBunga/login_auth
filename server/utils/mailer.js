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
  await transporter.sendMail({
    from: `"Login Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Verification Code",
    text: `Your verification code is ${code}.`,
  });
}

module.exports = { sendVerificationCodeEmail };
