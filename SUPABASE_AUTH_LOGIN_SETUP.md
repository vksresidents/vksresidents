# Supabase Login Setup Guide

## What's Been Created

✅ **Supabase Auth Hooks** - `useAuth()` hook for managing login/signup/logout  
✅ **Login Component** - New email/password login page at `/login-supabase`  
✅ **Auth Helpers** - Helper functions in `src/lib/supabase.ts`  
✅ **Integration** - Added "Sign in with Email / Supabase" button on main login page  

---

## STEP 1: Enable Email/Password Auth in Supabase

### 1.1 Go to Authentication Settings

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`pytkqhhcdoknioocuhka`)
3. Click **"Authentication"** in the left sidebar
4. Go to **"Providers"** tab

### 1.2 Enable Email/Password Provider

1. Find **"Email"** provider in the list
2. Click to expand it
3. Make sure **"Enable Email provider"** is toggled ON
4. Keep default settings or customize:
   - ✅ **Confirm email** - Recommended (requires email verification)
   - ✅ **Double confirm changes** - Recommended
5. Click **"Save"**

---

## STEP 2: Test Locally

### 2.1 Start Your Dev Server

```bash
npm run dev
```

### 2.2 Navigate to Supabase Login

1. Go to `http://localhost:5173/login`
2. Click **"Sign in with Email / Supabase"**
3. You should see the Supabase login form

### 2.3 Create a Test Account

1. Enter email: `test@example.com`
2. Enter password: `TestPassword123`
3. Click **"Create Account"**
4. You'll see: _"Account created! Please check your email to verify."_

### 2.4 Verify Email (Optional)

If email confirmation is enabled:
- Check the email inbox for a verification link
- Click the link to verify the account
- Then you can sign in

### 2.5 Sign In

1. Go back to `/login-supabase`
2. Click **"Sign In"** (toggle from Sign Up)
3. Enter your email and password
4. Click **"Sign In"**
5. You should be redirected to the portal home page

---

## STEP 3: Use the Auth Hook in Your Components

The `useAuth()` hook provides:

```typescript
import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, loading, error, isAuthenticated, signIn, signUp, signOut } = useAuth()

  // user = Current Supabase user object (or null)
  // loading = Loading state during auth operations
  // error = Any error messages
  // isAuthenticated = Boolean to check if user is logged in
}
```

---

## STEP 4: Integrate with Your App Store (Optional)

To sync Supabase auth with your existing `useApp()` store:

```typescript
// In your component or useEffect
import { useAuth } from '@/hooks/useAuth'
import { useApp } from '@/store/useApp'

const MyComponent = () => {
  const { user } = useAuth()
  const login = useApp(s => s.login)

  useEffect(() => {
    if (user) {
      // Map Supabase user to your app role
      login('parent') // or other roles
    }
  }, [user])
}
```

---

## STEP 5: Production Setup

### 5.1 Configure Email Provider

For production, you'll want real email verification:

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template
3. Update sender email in **Authentication** → **Settings**

### 5.2 Add Password Reset Page

Create a reset password flow using:

```typescript
import { supabase } from '@/lib/supabase'

// Request password reset
await supabase.auth.resetPasswordForEmail('user@example.com')

// Update password (after clicking reset link)
await supabase.auth.updateUser({ password: 'newPassword123' })
```

### 5.3 Redirect URLs

In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add your domain(s):
   - Development: `http://localhost:5173`
   - Production: `https://yourportal.com`

---

## Files Created/Modified

- ✅ [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Auth hook
- ✅ [src/pages/LoginWithSupabase.tsx](src/pages/LoginWithSupabase.tsx) - Login component
- ✅ [src/lib/supabase.ts](src/lib/supabase.ts) - Updated with auth functions
- ✅ [src/App.tsx](src/App.tsx) - Added `/login-supabase` route
- ✅ [src/pages/Login.tsx](src/pages/Login.tsx) - Added link to Supabase login

---

## Next Steps

1. ✅ Enable Email/Password in Supabase (Step 1)
2. ✅ Test locally (Step 2)
3. Customize the login UI or add additional features
4. Set up password reset flow (Step 5.2)
5. Deploy to production with proper email configuration

---

## Troubleshooting

### "Email provider not enabled"
→ Go to Authentication → Providers → Enable Email

### "User already registered"
→ Each email can only register once. Use a different email to test.

### "Invalid login credentials"
→ Check that email is verified (if email confirmation is enabled)
→ Ensure password is correct

### "Email not received"
→ Check spam/promotions folder
→ In development, check Supabase dashboard for the test email

---

## Features Ready to Use

- ✅ Sign up with email/password
- ✅ Sign in with email/password  
- ✅ Sign out
- ✅ Check authentication status
- ✅ Get current user info
- ✅ Built-in error handling
