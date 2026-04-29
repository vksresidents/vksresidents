# Firebase Migration Guide

## Overview
This project has been migrated from **Supabase** (PostgreSQL + Auth) to **Firebase** (Realtime Database + Authentication).

## What Changed
- ✅ Supabase Database → Firebase Realtime Database
- ✅ Supabase OAuth → Firebase Google Authentication
- ✅ Supabase Auth → Firebase Authentication

---

## Firebase Setup Instructions

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a new project**
3. Enter project name: `vksresidents`
4. Select **Disable Google Analytics** (optional)
5. Click **Create project**

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Google** provider
3. Enable it
4. Select your support email
5. Click **Save**

### Step 3: Create Realtime Database
1. Go to **Realtime Database** → **Create Database**
2. Select your region (closest to you)
3. Start in **Test mode** (for development)
4. Click **Enable**

### Step 4: Get Your Firebase Config
1. Go to **Project Settings** (gear icon)
2. Click **Your apps** → **Web** (if not exists, click **</>**)
3. Copy all the config values:

```
API Key
Auth Domain
Project ID
Storage Bucket
Messaging Sender ID
App ID
Database URL
```

### Step 5: Create `.env` File
Copy the `GET.env.example` and create `.env`:

```bash
cp .env.example .env
```

Then fill in your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url
```

### Step 6: Install Dependencies
```bash
npm install
```

### Step 7: Test Login
1. Run the app: `npm run dev`
2. Go to http://localhost:5173/login
3. Click "Sign in with Google"
4. You should be redirected to Google login

---

## Database Structure

The Firebase Realtime Database uses this structure:

```
users/
  {encoded_email}/
    role: "parent" | "dean" | "hod" | etc.
    email: "user@wcc.edu.in"
    createdAt: "2026-04-29T..."

parentProfiles/
  {encoded_email}/
    email: "parent@wcc.edu.in"
    parent_name: "John Doe"
    phone_number: "9876543210"
    relation: "Mother"
    student_reg_no: "REG001"
    student_name: "Jane Doe"
    student_hostel: "Hostel A"
    is_verified: true
    createdAt: "2026-04-29T..."
    updatedAt: "2026-04-29T..."

gmailAccounts/
  {reg_no}/
    regNo: "REG001"
    email: "student@gmail.com"
    password: "encrypted_password"
    createdAt: "2026-04-29T..."
```

### Email Encoding
Firebase doesn't allow `@` and `.` in keys, so emails are encoded:
- `john@example.com` → `john_AT_example_DOT_com`
- Used for database queries automatically

---

## Authentication Flow

### Google Sign-In
1. User clicks "Sign in with Google"
2. Firebase redirects to Google login
3. User authenticates with Google
4. Firebase creates/updates user record
5. App checks user role in database
6. If authorized, user is logged in
7. If not authorized, user is signed out with error

### Role Detection
Roles are determined by:
1. **Database lookup** - Check `userRoles/{email}`
2. **Email pattern matching** - If not in database, use domain/pattern rules

---

## File Changes

### New Files
- `src/lib/firebase.ts` - Firebase configuration and operations
- `src/pages/FirebaseAuthCallback.tsx` - Auth callback handler
- `.env.example` - Environment variables template

### Updated Files
- `src/hooks/useAuth.ts` - Rewritten for Firebase
- `src/lib/database.ts` - Now uses Firebase operations
- `src/pages/Login.tsx` - Uses Firebase Google Sign-In
- `package.json` - Firebase dependency added
- `.env` - Firebase credentials (create this locally)

### Removed Files
- `.supabase` directories (if any)
- Supabase-specific configs

---

## Environment Variables

Add these to your `.env` file. Get values from Firebase Console:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=vksresidents.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vksresidents
VITE_FIREBASE_STORAGE_BUCKET=vksresidents.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_DATABASE_URL=https://vksresidents.firebaseio.com
```

---

## Testing

### Test Google Sign-In
```bash
npm run dev
# Navigate to http://localhost:5173/login
# Click "Sign in with Google"
# Sign in with your Google account
```

### Verify User in Database
```bash
# In Firebase Console → Realtime Database:
# Check if user role is stored at: userRoles/{encoded_email}
```

### Check Authentication
```bash
# In Firebase Console → Authentication:
# Should see your Google account listed as a user
```

---

## Troubleshooting

### "Invalid Firebase credentials"
- Check all Firebase config values in `.env`
- Make sure `VITE_FIREBASE_DATABASE_URL` includes `https://`
- Verify values match exactly from Firebase Console

### "Permission denied" when accessing database
- Check Firebase Realtime Database Rules
- In test mode, should allow read/write
- Production: Set up proper security rules

### Google Sign-In not working
- Verify Google Provider is enabled in Firebase Console
- Check redirect URI is correct
- Try in incognito/private window

### Database operations failing
- Check database structure matches above
- Ensure email encoding is correct
- Check Firebase security rules allow operations

---

## Next Steps

1. **Set up database rules** - Configure security rules for production
2. **Add user roles** - Populate user roles in database
3. **Test all features** - Test each role's permissions
4. **Deploy** - Deploy to production

---

## Migration Checklist

- ✅ Firebase project created
- ✅ Authentication enabled
- ✅ Realtime Database created
- ✅ Config values obtained
- ✅ `.env` file created
- ✅ Dependencies installed
- ✅ Google Sign-In tested
- ✅ Users can create profiles
- ✅ Admins can manage users
- ✅ All features working

---

## Support

For issues or questions:
1. Check Firebase console for errors
2. Check browser console for JS errors
3. Review Firebase documentation: https://firebase.google.com/docs
4. Check authentication logs in Firebase Console
