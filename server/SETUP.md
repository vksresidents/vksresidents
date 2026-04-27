# Backend Setup Guide

## Prerequisites
- Node.js installed (v14+)
- npm or yarn

## Step 1: Install Dependencies

```bash
cd server
npm install
```

## Step 2: Gmail Configuration (CRITICAL!)

### Option A: Using Gmail App Password (Recommended)

Since Gmail no longer allows regular passwords for third-party apps, you need to use an **App-Specific Password**:

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click "Security" in left sidebar
   - Scroll to "2-Step Verification" and enable it

2. **Generate App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password

3. **Create `.env` file** in the `server` folder:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   GMAIL_FROM=your-email@gmail.com
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Replace values**:
   - `your-email@gmail.com` = Your Gmail address
   - `xxxx xxxx xxxx xxxx` = The 16-character app password from step 2

## Step 3: Run Backend

```bash
npm run dev
```

You should see:
```
🚀 Backend server running on http://localhost:5000
📧 Gmail: your-email@gmail.com
🌐 Frontend URL: http://localhost:5173
```

## Step 4: Test API

Send a test request:
```bash
curl -X POST http://localhost:5000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'
```

You should get:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

## API Endpoints

### Send OTP
- **POST** `/api/send-otp`
- **Body**: `{ "email": "user@gmail.com" }`
- **Response**: `{ "success": true, "message": "...", "expiresIn": 300 }`

### Verify OTP
- **POST** `/api/verify-otp`
- **Body**: `{ "email": "user@gmail.com", "otp": "123456" }`
- **Response**: `{ "success": true, "message": "OTP verified successfully" }`

### Resend OTP
- **POST** `/api/resend-otp`
- **Body**: `{ "email": "user@gmail.com" }`
- **Response**: `{ "success": true, "message": "...", "expiresIn": 300 }`

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using the **16-character App Password**, not your regular Gmail password
- Check that 2FA is enabled

### Email not received
- Check spam/trash folder
- Verify the email address is correct
- Check Gmail SMTP is not blocked

### CORS error
- Make sure `FRONTEND_URL` matches your frontend URL (usually `http://localhost:5173`)
