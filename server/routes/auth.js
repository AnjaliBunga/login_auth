const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const LoginChallenge = require('../models/LoginChallenge');
const { sendVerificationCodeEmail } = require('../utils/mailer');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash
    });

    return res.status(201).json({
      message: 'Signup successful',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

function generateSixDigitCode() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Signin (step 1: send code)
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create verification challenge
    const code = generateSixDigitCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const challenge = await LoginChallenge.create({
      userId: user._id,
      codeHash,
      expiresAt
    });

    // Try to send email, but don't fail if it doesn't work
    let emailSent = false;
    let showCode = false;
    try {
      const result = await sendVerificationCodeEmail({ to: user.email, code });
      if (result && result.success === false) {
        // Non-throwing failure (e.g., connection timeout surfaced as return)
        throw new Error(result.message || 'Email send failed');
      }
      emailSent = true;
      console.log(`✓ Verification code sent to ${user.email}`);
    } catch (mailErr) {
      console.error('⚠ Failed to send verification email:', mailErr?.message || mailErr);
      console.log(`[DEV] Verification code for ${user.email}: ${code} (challengeId: ${challenge._id})`);
      showCode = true;
    }

    return res.status(200).json({
      message: emailSent
        ? 'Verification code sent'
        : 'Verification code generated (check server logs if email not received)',
      challengeId: challenge._id.toString(),
      email: user.email,
      emailSent,
      showCode,
      code: showCode ? code : undefined
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Send code again (used in VerifyKeyPage)
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateSixDigitCode();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await LoginChallenge.create({
      userId: user._id,
      codeHash,
      expiresAt
    });

    try {
      const result = await sendVerificationCodeEmail({ to: user.email, code });
      if (result && result.success === false) {
        throw new Error(result.message || 'Email send failed');
      }
      console.log(`✓ Verification code sent to ${user.email}`);
      return res.status(200).json({ message: 'Verification code sent' });
    } catch (err) {
      console.error('⚠ Email sending failed:', err.message);
      console.log(`[DEV] Showing verification code in console: ${code}`);
      return res.status(200).json({
        message: 'Email blocked — showing code here',
        showCode: true,
        code
      });
    }
  } catch (err) {
    console.error('Send-code error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify (step 2: confirm code and log in)
router.post('/verify', async (req, res) => {
  try {
    const { challengeId, code } = req.body;
    if (!challengeId || !code) {
      return res.status(400).json({ message: 'challengeId and code are required' });
    }

    const challenge = await LoginChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(400).json({ message: 'Invalid or expired challenge' });
    }
    if (challenge.consumedAt) {
      return res.status(400).json({ message: 'This code has already been used' });
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      await LoginChallenge.deleteOne({ _id: challenge._id });
      return res.status(400).json({ message: 'Code expired' });
    }

    const providedHash = hashCode(code);
    if (providedHash !== challenge.codeHash) {
      return res.status(401).json({ message: 'Invalid code' });
    }

    challenge.consumedAt = new Date();
    await challenge.save();

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Login verified',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
