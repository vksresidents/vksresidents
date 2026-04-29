import { useEffect, useState } from 'react'
import { auth, onAuthStateChange, getUserRole, signOut as firebaseSignOut } from '@/lib/firebase'
import { useApp } from '@/store/useApp'
import { getRoleFromEmailPattern } from '@/lib/roleDetection'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Role } from '@/types/domain'

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const login = useApp((s) => s.login)
  const logout = useApp((s) => s.logout)

  useEffect(() => {
    let isMounted = true

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        console.log('🔄 Auth state changed:', firebaseUser?.email || 'logged out')

        if (firebaseUser) {
          console.log('✅ User found in Firebase:', firebaseUser.email)
          const email = firebaseUser.email || ''
          const name = firebaseUser.displayName || email.split('@')[0] || 'User'

          // Try to get role from database first
          let role: Role | null = null
          try {
            const dbRole = await getUserRole(email)
            if (dbRole) {
              console.log('✅ Found role in database:', dbRole)
              role = dbRole as Role
            }
          } catch (dbErr) {
            console.warn('⚠️ Could not fetch role from database, using pattern detection')
          }

          // Fallback to email pattern if not in database
          if (!role) {
            console.warn('⚠️ Role not in DB, using email pattern detection')
            role = getRoleFromEmailPattern(email)
          }

          if (!role) {
            console.error('❌ Could not determine role for:', email)
            if (isMounted) setError('Your email is not authorized for this portal')
            await firebaseSignOut()
            if (isMounted) logout()
            return
          }

          console.log('✅ User authorized as:', role)

          // Sync with app store
          login({
            name,
            email,
            role,
            parentId: role === 'parent' ? `parent-${firebaseUser.uid}` : undefined
          })

          if (isMounted) setUser(firebaseUser)
        } else {
          console.log('❌ No user found')
          if (isMounted) {
            setUser(null)
            logout()
          }
        }
      } catch (err) {
        console.error('❌ Auth state change error:', err)
        if (isMounted) setError(err instanceof Error ? err.message : 'Authentication error')
      } finally {
        if (isMounted) setLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [login, logout])

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut()
      logout()
      setUser(null)
      return { error: null }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMsg)
      return { error: errorMsg }
    }
  }

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: !!user
  }
}
