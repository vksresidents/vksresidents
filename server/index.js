import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// In-memory OTP storage (use Redis/Database in production)
const otpStore = new Map();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // App-specific password, not regular password
  }
});

// Utility: Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility: Send email
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_FROM,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// API: Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with 5-minute expiry
    otpStore.set(email, {
      otp,
      createdAt: Date.now(),
      attempts: 0
    });

    // Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1f5f3f;">Women's Christian College</h2>
        <h3>Residents Permission Portal</h3>
        <p>Your OTP for email verification is:</p>
        <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; color: #1f5f3f;">
          ${otp}
        </h1>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© Women's Christian College, Chennai. All rights reserved.</p>
      </div>
    `;

    const sent = await sendEmail(
      email,
      'Your OTP - WCC Residents Permission Portal',
      emailHtml
    );

    if (sent) {
      res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        expiresIn: 300 // 5 minutes
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    // Check if OTP expired (5 minutes)
    const isExpired = Date.now() - storedData.createdAt > 5 * 60 * 1000;
    if (isExpired) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // Check attempts (max 5)
    if (storedData.attempts >= 5) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP',
        attemptsLeft: 5 - storedData.attempts
      });
    }

    // OTP verified successfully
    otpStore.delete(email);
    res.json({ 
      success: true, 
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: Resend OTP
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    // Delete old OTP
    otpStore.delete(email);

    // Generate new OTP
    const otp = generateOTP();
    
    otpStore.set(email, {
      otp,
      createdAt: Date.now(),
      attempts: 0
    });

    // Send email (same HTML as send-otp)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1f5f3f;">Women's Christian College</h2>
        <h3>Residents Permission Portal</h3>
        <p>Your new OTP for email verification is:</p>
        <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; color: #1f5f3f;">
          ${otp}
        </h1>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© Women's Christian College, Chennai. All rights reserved.</p>
      </div>
    `;

    const sent = await sendEmail(
      email,
      'Your OTP - WCC Residents Permission Portal',
      emailHtml
    );

    if (sent) {
      res.json({ 
        success: true, 
        message: 'OTP resent successfully',
        expiresIn: 300
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📧 Gmail: ${process.env.GMAIL_USER}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});
