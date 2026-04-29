import { supabase } from './supabase'

// ============================================================================
// GOOGLE SIGN-IN
// ============================================================================

export const signInWithGoogle = async () => {
  try {
    console.log('🔵 Starting Google sign-in...')
    console.log('📍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('📍 Redirect URL:', `${window.location.origin}/auth/callback`)
    console.log('🔍 Supabase instance:', supabase)
    
    console.log('Calling signInWithOAuth with Google provider...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    console.log('OAuth response:', { data, error })
    
    if (error) {
      console.error('❌ Google sign-in error:', error)
      throw new Error(`OAuth Error: ${error.message}`)
    }
    
    console.log('✅ Google sign-in successful, redirecting to:', data?.url)
    // The OAuth flow will redirect the page, so we might not reach here
    return { data, error: null }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Google sign-in exception:', errorMsg)
    console.error('Full error:', err)
    return { data: null, error: errorMsg }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
  return subscription
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}
