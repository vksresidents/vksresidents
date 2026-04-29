import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '@/lib/firebase'

/**
 * Firebase OAuth Callback Handler
 * Firebase automatically handles OAuth redirects, so this page just waits for auth state to settle
 */
export default function OAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const handleCallback = async () => {
      try {
        console.log('🔵 Firebase OAuth Callback - checking auth state...')

        // Wait a moment for Firebase to settle
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if user is authenticated
        const currentUser = getCurrentUser()

        if (currentUser && mounted) {
          console.log('✅ User authenticated:', currentUser.email)
          navigate('/', { replace: true })
        } else if (mounted) {
          // User not authenticated, redirect to login
          console.log('❌ No user found, redirecting to login')
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('❌ Callback error:', err)
        if (mounted) {
          navigate('/login', { replace: true })
        }
      }
    }

    handleCallback()

    return () => {
      mounted = false
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign-in...</p>
        <p className="text-xs text-muted-foreground mt-2">Processing your authentication...</p>
      </div>
    </div>
  )
}
