// mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  pool: true,
  connectionTimeout: 10000,
});

// Verify email config
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email config error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

const sendVerificationCodeEmail = async ({ to, code }) => {
  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: to.trim(),
    subject: "Your Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px;">${code}</p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error("⚠️ Failed to send verification email:", error.message);

    // Fallback for environments where SMTP is blocked
    return {
      success: false,
      message:
        "SMTP is blocked on the deployed server. Showing verification code directly.",
      code,
    };
  }
};

module.exports = { sendVerificationCodeEmail };
