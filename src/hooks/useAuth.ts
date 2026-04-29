import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/store/useApp'
import { getUserCredentials, getRoleFromEmailPattern } from '@/lib/authDatabase'
import type { User } from '@supabase/supabase-js'
import type { Role } from '@/types/domain'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const login = useApp((s) => s.login)

  useEffect(() => {
    let isMounted = true

    const syncAuthState = async () => {
      try {
        console.log('🔵 Syncing auth state...')
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          if (isMounted) setError(sessionError.message)
          return
        }

        if (session?.user) {
          console.log('✅ User found in Supabase:', session.user.email)
          const email = session.user.email || ''
          const name = session.user.user_metadata?.full_name || email.split('@')[0] || 'User'
          
          // Try to verify email in database first
          const { user: credentials, error: credError, rls } = await getUserCredentials(email) as any
          
          let role: Role | null = null
          
          if (credentials) {
            // Database lookup succeeded
            console.log('✅ Found in database as:', credentials.role)
            role = credentials.role
          } else if (rls) {
            // RLS prevented query but user has valid OAuth session - use pattern matching
            console.warn('⚠️ Using email pattern detection (RLS prevented DB query)')
            role = getRoleFromEmailPattern(email)
          } else if (credError?.includes('not found')) {
            // Email not in database - use pattern matching as fallback
            console.warn('⚠️ Email not in DB, trying pattern detection')
            role = getRoleFromEmailPattern(email)
          }
          
          if (!role) {
            console.error('❌ Could not determine role for:', email)
            if (isMounted) setError('Your email is not authorized for this portal')
            await supabase.auth.signOut()
            return
          }
          
          console.log('✅ User authorized as:', role)
          
          // Sync with app store
          login({
            name,
            email,
            role,
            parentId: role === 'parent' ? `parent-${session.user.id}` : undefined
          })
          
          if (isMounted) setUser(session.user)
        } else {
          console.log('❌ No session found')
          if (isMounted) setUser(null)
        }
      } catch (err) {
        console.error('❌ Sync error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // Initial sync
    syncAuthState()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      if (session?.user) {
        console.log('✅ Auth changed - user:', session.user.email)
        const email = session.user.email || ''
        const name = session.user.user_metadata?.full_name || email.split('@')[0] || 'User'
        
        // Try to verify email in database first
        const { user: credentials, error: credError, rls } = await getUserCredentials(email) as any
        
        let role: Role | null = null
        
        if (credentials) {
          // Database lookup succeeded
          console.log('✅ Found in database as:', credentials.role)
          role = credentials.role
        } else if (rls) {
          // RLS prevented query but user has valid OAuth session - use pattern matching
          console.warn('⚠️ Using email pattern detection (RLS prevented DB query)')
          role = getRoleFromEmailPattern(email)
        } else if (credError?.includes('not found')) {
          // Email not in database - use pattern matching as fallback
          console.warn('⚠️ Email not in DB, trying pattern detection')
          role = getRoleFromEmailPattern(email)
        }
        
        if (!role) {
          console.error('❌ Could not determine role for:', email)
          if (isMounted) setError('Your email is not authorized for this portal')
          await supabase.auth.signOut()
          return
        }
        
        console.log('✅ User authorized as:', role)
        
        login({
          name,
          email,
          role,
          parentId: role === 'parent' ? `parent-${session.user.id}` : undefined
        })
        
        if (isMounted) setUser(session.user)
      } else {
        console.log('✅ Auth changed - user logged out')
        if (isMounted) setUser(null)
      }
      
      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [login])

  const signUp = async (email: string, password: string) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      setError(error.message)
      return { data: null, error }
    }
    return { data, error: null }
  }

  const signIn = async (email: string, password: string) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      setError(error.message)
      return { data: null, error }
    }
    return { data, error: null }
  }

  const signOut = async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
      return { error }
    }
    setUser(null)
    return { error: null }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }
}
