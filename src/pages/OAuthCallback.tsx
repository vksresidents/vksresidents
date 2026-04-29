import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * OAuth Callback Handler - Simplified and correct approach
 */
export default function OAuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let timeout: NodeJS.Timeout

    const handleCallback = async () => {
      try {
        console.log('🔵 OAuth Callback - URL:', window.location.href)
        
        // Supabase SDK automatically processes the URL hash (#access_token=...)
        // when the page loads. Just give it a moment to settle.
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if session was established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Session fetch error:', sessionError)
          if (mounted) setError('Session error: ' + sessionError.message)
          return
        }

        if (session?.user) {
          console.log('✅ Session established:', session.user.email)
          if (mounted) navigate('/', { replace: true })
          return
        }

        // Session not found immediately, wait for auth state event
        console.log('⏳ Waiting for Supabase auth initialization...')

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          console.log('Auth event:', currentSession?.user?.email ? 'Session found' : 'No session')
          
          if (currentSession?.user && mounted) {
            console.log('✅ User authenticated:', currentSession.user.email)
            subscription?.unsubscribe()
            navigate('/', { replace: true })
          }
        })

        // Timeout after 5 seconds
        timeout = setTimeout(() => {
          subscription?.unsubscribe()
          if (mounted) {
            console.error('❌ OAuth timeout - no session established')
            setError('Login timeout. Please try again.')
            setTimeout(() => navigate('/login', { replace: true }), 2000)
          }
        }, 5000)

        return () => {
          subscription?.unsubscribe()
        }
      } catch (err) {
        console.error('❌ Callback error:', err)
        if (mounted) setError('Login failed: ' + (err instanceof Error ? err.message : String(err)))
      }
    }

    handleCallback()

    return () => {
      mounted = false
      if (timeout) clearTimeout(timeout)
    }
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <p className="text-destructive font-semibold mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

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
