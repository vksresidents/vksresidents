# Complete Gmail OTP Setup Guide

## Overview
✅ Backend: Node.js + Express server running on port 5000
✅ Email Service: Nodemailer with Gmail SMTP
✅ Frontend: React app making API calls to backend
✅ OTP Features: 5-minute expiry, 5 attempt limit, rate limiting

---

## STEP 1: Gmail Configuration (5 minutes)

### 1.1 Enable 2-Factor Authentication

1. Go to **[myaccount.google.com](https://myaccount.google.com)**
2. Click **"Security"** in the left sidebar
3. Find **"2-Step Verification"** and click it
4. Click **"Get Started"**
5. Follow Google's prompts to verify your phone
6. Once enabled, you'll see a green checkmark

### 1.2 Generate App-Specific Password

1. Go to **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
2. You should see dropdowns for "Select the app" and "Select the device"
3. Choose **"Mail"** from the app dropdown
4. Choose **"Windows Computer"** from the device dropdown
5. Click **"Generate"**
6. Google will show a **16-character password** like: `xxxx xxxx xxxx xxxx`
7. **Copy this password** (you won't see it again)

---

## STEP 2: Backend Setup (5 minutes)

### 2.1 Create `.env` file

1. Open the `server` folder in VS Code
2. Create a new file named `.env` (exactly)
3. Copy this content and fill in your details:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM=your-email@gmail.com
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-email@gmail.com` = Your Gmail address
- `xxxx xxxx xxxx xxxx` = The 16-character app password from Step 1.2

### 2.2 Install Dependencies

Open terminal in `server` folder:
```bash
npm install
```

This will install:
- `express` - web framework
- `nodemailer` - email service
- `cors` - enable frontend requests
- `dotenv` - load environment variables

### 2.3 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Backend server running on http://localhost:5000
📧 Gmail: your-email@gmail.com
🌐 Frontend URL: http://localhost:5173
```

✅ **Backend is ready!**

---

## STEP 3: Frontend Setup (Already Done!)

The frontend files have been updated to call the backend APIs:
- ✅ `ParentGmailSignup.tsx` - Calls `/api/send-otp`
- ✅ `ParentOtpVerification.tsx` - Calls `/api/verify-otp` and `/api/resend-otp`

No additional setup needed!

---

## STEP 4: Test the Flow

### 4.1 Start Both Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### 4.2 Test the Gmail Signup Flow

1. Go to **http://localhost:5173**
2. Click **"Sign in as Parent with Gmail"**
3. Enter:
   - **Email**: `24CSC32parent@gmail.com` (must be created by admin first)
   - **Password**: `wcc@@2024`
4. Click **Continue**
5. ✅ Check your Gmail inbox for the OTP
6. Copy the 6-digit OTP into the verification form
7. Click **Continue**
8. Fill in your parent and student details
9. ✅ You're logged in as parent!

---

## API Reference

### 1. Send OTP
```bash
POST http://localhost:5000/api/send-otp
Content-Type: application/json

{
  "email": "24csc32parent@gmail.com"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

### 2. Verify OTP
```bash
POST http://localhost:5000/api/verify-otp
Content-Type: application/json

{
  "email": "24csc32parent@gmail.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### 3. Resend OTP
```bash
POST http://localhost:5000/api/resend-otp
Content-Type: application/json

{
  "email": "24csc32parent@gmail.com"
}

Response:
{
  "success": true,
  "message": "OTP resent successfully",
  "expiresIn": 300
}
```

---

## Troubleshooting

### ❌ Error: "Invalid credentials"
**Solution:** 
- Make sure you used the **16-character App Password**, not your regular Gmail password
- Check that 2FA is actually enabled in your Gmail

### ❌ Error: "CORS error" or "Backend not running"
**Solution:**
- Make sure backend is running: `npm run dev` in the `server` folder
- Check that backend is on `http://localhost:5000`
- Check FRONTEND_URL in `.env` matches your frontend URL

### ❌ Email not received
**Solution:**
- Check **Spam/Trash** folder
- Wait a few seconds (Gmail is usually instant)
- Check that the email address is correct
- Verify Gmail allows "Less Secure Apps" (should allow if using App Password)

### ❌ OTP expired message
**Solution:**
- OTP is only valid for **5 minutes**
- Click "Resend OTP" to get a new one
- You get **5 attempts** before OTP expires

---

## Production Deployment

### For Production (not for testing):

**Use these email services instead:**
1. **SendGrid** - Most reliable, free tier available
2. **AWS SES** - Scalable, pay-as-you-go
3. **MailGun** - Easy setup, great documentation

**Use database instead of memory:**
- Replace `otpStore` Map with **MongoDB** or **PostgreSQL**
- This persists OTPs even if server restarts

**Required changes:**
```javascript
// Current (development):
const otpStore = new Map();

// Production (use database):
const otpStore = new Database();
```

---

## Summary

| Component | Status | Port |
|-----------|--------|------|
| Frontend (React) | ✅ Ready | 5173 |
| Backend (Express) | ✅ Ready | 5000 |
| Email Service | ✅ Gmail SMTP | - |
| Database | ❌ In-memory (dev only) | - |

**You're all set to test real Gmail OTP!** 🎉

Need help? Check the logs in both terminals for error messages.
