const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Optional timeout to avoid long hangs
  pool: true,
  connectionTimeout: 10000, // 10 seconds
});

// Verify configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email config error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to send verification code
const sendVerificationCodeEmail = async ({ to, code }) => {
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: to.trim(),
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to: ${to}`);
  } catch (error) {
    console.error('⚠️ Failed to send verification email:', error.message);
    console.log(`🧩 [DEV ONLY] Verification code for ${to}: ${code}`);
    console.log('📌 Check the above code in Render logs if email not received.');
  }
};

module.exports = { sendVerificationCodeEmail };
