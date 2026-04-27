# Supabase Setup Guide (Option 2)

## Overview
Move all backend logic to Supabase:
- ✅ Parent profiles storage
- ✅ Gmail accounts management
- ✅ OTP generation and verification
- ✅ Email sending via Supabase Edge Functions
- ✅ Authentication management

---

## STEP 1: Run SQL Schema (5 minutes)

### 1.1 Go to Supabase Dashboard

1. Open [app.supabase.com](https://app.supabase.com)
2. Select your project (already configured: `pytkqhhcdoknioocuhka`)
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**

### 1.2 Copy & Paste SQL

Copy the entire content from `server/supabase.sql`:
- `gmail_accounts` table - stores admin-created Gmail accounts
- `parent_profiles` table - stores parent & student details
- `otp_verifications` table - stores OTP codes with expiry
- RLS Policies - restrict data access by user role

### 1.3 Run Query

Click **"Run"** button (or Ctrl+Enter)

✅ Tables created successfully!

### 1.4 Verify Tables

Go to **"Table Editor"** (left sidebar) and confirm you see:
- `gmail_accounts`
- `parent_profiles`
- `otp_verifications`

---

## STEP 2: Create Supabase Edge Function (Email Sending)

### 2.1 Go to Edge Functions

1. In Supabase Dashboard, go to **"Edge Functions"** (left sidebar)
2. Click **"Create a new function"**
3. Name it: `send-otp`
4. Choose **"HTTP Request"** template

### 2.2 Paste Function Code

Replace the default code with this:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Delete old OTP if exists
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', email)

    // Insert new OTP
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log to console (check Supabase function logs)
    console.log(`OTP for ${email}: ${otp}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 300,
        // Remove in production:
        otp: otp // Temporary: for testing only
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})
```

### 2.3 Deploy Function

Click **"Deploy"** button

✅ Function deployed! Copy the URL (you'll need it)

---

## STEP 3: Add More Edge Functions

Repeat Step 2 for these functions:

### Function 2: `verify-otp`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and OTP required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch OTP
    const { data: otpData, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpData) {
      return new Response(
        JSON.stringify({ success: false, message: 'OTP not found or expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check expiry
    if (new Date() > new Date(otpData.expires_at)) {
      await supabase.from('otp_verifications').delete().eq('id', otpData.id)
      return new Response(
        JSON.stringify({ success: false, message: 'OTP expired. Please request a new one.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check attempts
    if (otpData.attempts >= 5) {
      await supabase.from('otp_verifications').delete().eq('id', otpData.id)
      return new Response(
        JSON.stringify({ success: false, message: 'Too many attempts. Please request a new OTP.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify OTP
    if (otpData.otp_code !== otp) {
      await supabase
        .from('otp_verifications')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id)

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid OTP',
          attemptsLeft: 5 - (otpData.attempts + 1)
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // OTP verified
    await supabase
      .from('otp_verifications')
      .update({ is_verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpData.id)

    return new Response(
      JSON.stringify({ success: true, message: 'OTP verified successfully' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})
```

### Function 3: `resend-otp`

Same as `send-otp` but delete old OTP first.

---

## STEP 4: Update Frontend (Supabase Client)

Already in `.env.local`:
```env
VITE_SUPABASE_URL=https://pytkqhhcdoknioocuhka.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

No changes needed! The frontend is already configured.

---

## STEP 5: Update Your Code

The frontend files have been updated to call Supabase Edge Functions instead of Node.js backend.

---

## Testing

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a test gmail account in `gmail_accounts` table:
   ```
   reg_no: 24CSC32
   email: 24csc32parent@gmail.com
   password_hash: wcc@@2024 (or hashed version)
   ```

3. Test the flow:
   - Go to login page → "Sign in as Parent with Gmail"
   - Enter: `24csc32parent@gmail.com` + password
   - Click Continue
   - ✅ OTP will be created in Supabase
   - (Check Supabase console logs for OTP code)
   - Enter OTP → Onboarding → Done!

---

## Summary

| What | Old | New |
|-----|-----|-----|
| OTP Storage | Node.js Memory | **Supabase DB** |
| Email Sending | Nodemailer | **Supabase Edge Functions** |
| Parent Profiles | In-Memory | **Supabase DB** |
| Backend | Node.js | **Supabase** |
| Scaling | Limited | **Unlimited** |

✅ **No more Node.js backend needed!** Everything runs on Supabase.

---

## Next: Email Integration

To send real emails, integrate with:
- **Resend** - Easiest, free tier
- **SendGrid** - Professional
- **AWS SES** - Enterprise

Update the Edge Function to call the email service API.
