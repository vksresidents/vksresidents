# Supabase React Integration Guide

## ✅ Setup Complete!

Your Supabase connection is now configured with **Google Sign-In** authentication. Here's how to use it in your React components.

---

## 🔐 Google Sign-In Setup

### 1. Configure OAuth in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication → Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials (from [Google Cloud Console](https://console.cloud.google.com))
5. Add your redirect URI: `https://pavqftuiqjiqveefanqr.supabase.co/auth/v1/callback`

### 2. Sign In with Google

```typescript
import { supabase } from '@/lib/supabase'

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  
  if (error) {
    console.error('Sign in error:', error.message)
  }
}
```

### 3. Use Authentication State

```typescript
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { user, loading, isAuthenticated, signOut } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <SignInButton onClick={signInWithGoogle} />
  }

  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

---

## 📝 Available Hooks & Functions

### Parent Profiles
```typescript
import { 
  useParentProfile,
  useAllParentProfiles,
  useCreateParentProfile,
  useUpdateParentProfile,
  useVerifyParentProfile
} from '@/hooks/useDatabase'

// Fetch single parent profile
const { data: profile, isLoading, error } = useParentProfile(userEmail)

// Fetch all parent profiles
const { data: profiles, isLoading } = useAllParentProfiles()

// Create new parent profile
const createMutation = useCreateParentProfile()
await createMutation.mutateAsync({
  email: 'parent@example.com',
  parent_name: 'John Doe',
  phone_number: '1234567890',
  relation: 'Father',
  student_reg_no: 'REG001',
  student_name: 'Jane Doe',
  student_hostel: 'Hostel A'
})

// Update existing profile
const updateMutation = useUpdateParentProfile()
await updateMutation.mutateAsync({
  email: userEmail,
  updates: { phone_number: '9999999999' }
})

// Verify parent profile
const verifyMutation = useVerifyParentProfile()
await verifyMutation.mutateAsync(userEmail)
```

### Gmail Accounts (Admin)
```typescript
import {
  useAllGmailAccounts,
  useGmailAccountByRegNo
} from '@/hooks/useDatabase'

// Fetch all gmail accounts
const { data: accounts } = useAllGmailAccounts()

// Fetch by registration number
const { data: account } = useGmailAccountByRegNo('REG001')
```

---

## 🎯 Example: Parent Onboarding Component

```typescript
import { useCreateParentProfile, useVerifyParentProfile } from '@/hooks/useDatabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export default function ParentOnboarding() {
  const { user } = useAuth()
  const { toast } = useToast()
  const createProfile = useCreateParentProfile()
  const verifyProfile = useVerifyParentProfile()

  const handleCreateProfile = async (formData) => {
    try {
      await createProfile.mutateAsync({
        email: user?.email!,
        parent_name: formData.parentName,
        phone_number: formData.phone,
        relation: formData.relation,
        student_reg_no: formData.studentRegNo,
        student_name: formData.studentName,
        student_hostel: formData.hostel
      })
      
      toast({
        title: 'Success',
        description: 'Profile created successfully!'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create profile',
        variant: 'destructive'
      })
    }
  }

  return (
    <div>
      {/* Your form UI here */}
      <button 
        onClick={() => handleCreateProfile(formData)}
        disabled={createProfile.isPending}
      >
        {createProfile.isPending ? 'Creating...' : 'Create Profile'}
      </button>
    </div>
  )
}
```

---

## 🔧 Direct Database Functions

If you need to call database functions directly without React Query caching:

```typescript
import {
  fetchParentProfile,
  fetchAllParentProfiles,
  createParentProfile,
  updateParentProfile,
  createOTPVerification,
  verifyOTP
} from '@/lib/database'

// These return { data, error } objects
const { data, error } = await fetchParentProfile('user@example.com')
const { data, error } = await createParentProfile({ ... })
const { data, error } = await verifyOTP('user@example.com', '123456')
```

---

## 📊 Table Structure

### parent_profiles
- `id` - UUID
- `email` - VARCHAR
- `parent_name` - VARCHAR
- `phone_number` - VARCHAR
- `relation` - VARCHAR (Mother, Father, etc.)
- `student_reg_no` - VARCHAR
- `student_name` - VARCHAR
- `student_hostel` - VARCHAR
- `is_verified` - BOOLEAN
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### gmail_accounts
- `id` - UUID
- `reg_no` - VARCHAR
- `email` - VARCHAR
- `password_hash` - VARCHAR
- `is_active` - BOOLEAN
- `created_at` - TIMESTAMP
- `created_by` - UUID

---

## 🚀 Next Steps

1. ✅ Environment variables configured
2. ✅ Database functions created
3. ✅ React hooks with caching set up
4. **Next:** Configure Google OAuth in Supabase Dashboard
5. **Next:** Update your login page to use `signInWithGoogle()`
6. **Next:** Update components to fetch real parent data after auth

---

## ⚠️ Important Notes

- **Row Level Security (RLS) is enabled** on all tables
- Parents can only see their own data using Supabase Auth
- Admins can see all data
- Google Sign-In requires OAuth configuration in Supabase
- Make sure your Supabase tables match the schema in `server/supabase.sql` (OTP table is optional now)

