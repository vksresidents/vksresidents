# Google OAuth Setup in Supabase

## Your Google Credentials
- **Client ID**: `82654104312-n1hc32oqakaqs88k6eibdkubimd3fcob.apps.googleusercontent.com`
- **Client Secret**: `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`

---

## Step-by-Step Setup in Supabase

### 1. Go to Supabase Dashboard
- Visit: https://app.supabase.com
- Login to your account

### 2. Select Your Project
- Click on **pavqftuiqjiqveefanqr** (your project)

### 3. Navigate to Authentication
- Left sidebar → Click **Authentication**
- Then click **Providers**

### 4. Find and Configure Google Provider

Look for **Google** in the providers list. You'll see something like:

```
Google
[OFF] ← Toggle to turn ON
```

### 5. Click on Google Provider
A form will appear with these fields:

```
☑ Enable sign-ups
[ Client ID ]              ← Paste here
[ Client Secret ]          ← Paste here
[ Authorized redirect URI ] ← Already filled
```

### 6. Paste Your Credentials

**In the "Client ID" field, paste:**
```
82654104312-n1hc32oqakaqs88k6eibdkubimd3fcob.apps.googleusercontent.com
```

**In the "Client Secret" field, paste:**
```
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
```

### 7. Copy Your Redirect URI
Supabase will show you a "Authorized redirect URI" - it will look like:
```
https://pavqftuiqjiqveefanqr.supabase.co/auth/v1/callback
```

✅ **Copy this URL** - you may need it for Google Console if not already added

### 8. Save in Google Cloud Console
Go back to Google Cloud Console (https://console.cloud.google.com):
- Your project → APIs & Services → Credentials
- Find your OAuth 2.0 Client ID
- Click it to edit
- Under **Authorized redirect URIs**, add:
  ```
  https://pavqftuiqjiqveefanqr.supabase.co/auth/v1/callback
  ```
- Click **Save**

### 9. Enable Google Provider in Supabase
- Back in Supabase Providers page
- Toggle **Google to ON** (make sure it's enabled)
- Click **Save** button

---

## ✅ Done!

Your Google Sign-In is now configured! 

**Test it:**
1. Run your React app: `npm run dev`
2. Go to the Login page
3. Click **"Sign in with Google"** button
4. You should be redirected to Google login
5. After signing in, you'll be logged into your app

---

## Troubleshooting

**"Invalid redirect URI" error?**
- Make sure the redirect URI matches exactly in both Google Console and Supabase
- It should be: `https://pavqftuiqjiqveefanqr.supabase.co/auth/v1/callback`

**"Client ID not found" error?**
- Double-check you copied the full Client ID (it's very long)
- Make sure there are no extra spaces

**Still not working?**
- Wait 5-10 minutes for Google to propagate the changes
- Try in an incognito/private window
- Clear browser cache

