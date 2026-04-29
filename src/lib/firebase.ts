import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth'
import { getDatabase, ref, get, set, update, child, Database, DatabaseReference } from 'firebase/database'

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

// Validate Firebase config
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'databaseURL']
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])

if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase credentials in .env: ${missingKeys.join(', ')}`)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Firebase Realtime Database
export const database = getDatabase(app)

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'consent'
})

// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

export const signInWithGoogle = async () => {
  try {
    console.log('🔵 Starting Google sign-in...')
    const result = await signInWithPopup(auth, googleProvider)
    console.log('✅ Google sign-in successful:', result.user.email)
    return { user: result.user, error: null }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Google sign-in error:', errorMsg)
    return { user: null, error: errorMsg }
  }
}

// ============================================================================
// SIGN OUT
// ============================================================================

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    console.log('✅ User signed out')
    return { error: null }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Sign out error:', errorMsg)
    return { error: errorMsg }
  }
}

// ============================================================================
// GET CURRENT USER
// ============================================================================

export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// ============================================================================
// AUTH STATE CHANGE LISTENER
// ============================================================================

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user)
  })
}

// ============================================================================
// DATABASE OPERATIONS - USER ROLES
// ============================================================================

/**
 * Get user role from database
 */
export const getUserRole = async (email: string): Promise<string | null> => {
  try {
    const snapshot = await get(child(ref(database), `userRoles/${encodeEmail(email)}`))
    if (snapshot.exists()) {
      return snapshot.val().role
    }
    return null
  } catch (err) {
    console.error('❌ Error getting user role:', err)
    return null
  }
}

/**
 * Set user role in database
 */
export const setUserRole = async (email: string, role: string): Promise<boolean> => {
  try {
    await set(ref(database, `userRoles/${encodeEmail(email)}`), {
      role,
      email,
      createdAt: new Date().toISOString()
    })
    console.log('✅ User role set:', email, role)
    return true
  } catch (err) {
    console.error('❌ Error setting user role:', err)
    return false
  }
}

// ============================================================================
// DATABASE OPERATIONS - PARENT PROFILES
// ============================================================================

/**
 * Get parent profile by email
 */
export const fetchParentProfileByEmail = async (email: string) => {
  try {
    const snapshot = await get(child(ref(database), `parentProfiles/${encodeEmail(email)}`))
    if (snapshot.exists()) {
      return { data: snapshot.val(), error: null }
    }
    return { data: null, error: 'Parent profile not found' }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error fetching parent profile:', err)
    return { data: null, error: errorMsg }
  }
}

/**
 * Create or update parent profile
 */
export const saveParentProfile = async (email: string, profile: any) => {
  try {
    const encodedEmail = encodeEmail(email)
    await set(ref(database, `parentProfiles/${encodedEmail}`), {
      ...profile,
      email,
      updatedAt: new Date().toISOString()
    })
    console.log('✅ Parent profile saved:', email)
    return { data: profile, error: null }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error saving parent profile:', err)
    return { data: null, error: errorMsg }
  }
}

/**
 * Get all parent profiles (admin only)
 */
export const fetchAllParentProfiles = async () => {
  try {
    const snapshot = await get(child(ref(database), 'parentProfiles'))
    if (snapshot.exists()) {
      const profiles = snapshot.val()
      return { data: Object.values(profiles), error: null }
    }
    return { data: [], error: null }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error fetching parent profiles:', err)
    return { data: null, error: errorMsg }
  }
}

// ============================================================================
// DATABASE OPERATIONS - GMAIL ACCOUNTS
// ============================================================================

/**
 * Get Gmail account by registration number
 */
export const fetchGmailAccountByRegNo = async (regNo: string) => {
  try {
    const snapshot = await get(child(ref(database), `gmailAccounts/${regNo}`))
    if (snapshot.exists()) {
      return { data: snapshot.val(), error: null }
    }
    return { data: null, error: 'Gmail account not found' }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error fetching Gmail account:', err)
    return { data: null, error: errorMsg }
  }
}

/**
 * Get all Gmail accounts
 */
export const fetchAllGmailAccounts = async () => {
  try {
    const snapshot = await get(child(ref(database), 'gmailAccounts'))
    if (snapshot.exists()) {
      const accounts = snapshot.val()
      return { data: Object.values(accounts), error: null }
    }
    return { data: [], error: null }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error fetching Gmail accounts:', err)
    return { data: null, error: errorMsg }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Encode email for use as database key
 * Firebase doesn't allow '@' or '.' in keys, so we encode them
 */
export const encodeEmail = (email: string): string => {
  return email.replace(/\./g, '_DOT_').replace(/@/g, '_AT_')
}

/**
 * Decode encoded email
 */
export const decodeEmail = (encoded: string): string => {
  return encoded.replace(/_DOT_/g, '.').replace(/_AT_/g, '@')
}
