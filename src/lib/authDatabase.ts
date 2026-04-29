import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/domain'

/**
 * Get user credentials from database
 * Verifies email exists in login_credentials table
 */
export const getUserCredentials = async (email: string) => {
  try {
    console.log('🔍 Looking up email in database:', email)

    const { data, error } = await supabase
      .from('login_credentials')
      .select('email, role, staffId')
      .eq('email', email)
      .single() // Expect exactly one result

    if (error) {
      console.error('❌ Database error:', error.message, error.code)
      
      if (error.code === 'PGRST116') {
        // No rows found
        console.error('❌ Email not found in login_credentials:', email)
        return { user: null, error: 'Email not authorized for this portal' }
      }
      
      if (error.code === '42501') {
        // RLS policy violation - allow it (this is just a verification check)
        console.warn('⚠️ RLS prevented query, but user has valid session')
        return { user: null, error: null, rls: true }
      }
      
      console.error('❌ Unexpected database error:', error)
      return { user: null, error: error.message }
    }

    if (!data) {
      console.error('❌ No data returned')
      return { user: null, error: 'Email not authorized for this portal' }
    }

    console.log('✅ User found in database:', data.email, 'Role:', data.role)

    return {
      user: {
        email: data.email,
        role: data.role as Role,
        staffId: data.staffId
      },
      error: null
    }
  } catch (err) {
    console.error('❌ Error checking credentials:', err)
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

/**
 * Get role from email pattern (fallback if database check fails)
 */
export const getRoleFromEmailPattern = (email: string): Role | null => {
  if (!email) return null

  const lowerEmail = email.toLowerCase()

  if (lowerEmail.startsWith('hod.') && lowerEmail.endsWith('@wcc.edu.in')) {
    return 'hod'
  }
  if (lowerEmail.startsWith('dean.') && lowerEmail.endsWith('@wcc.edu.in')) {
    return 'dean'
  }
  if (lowerEmail.startsWith('warden.') && lowerEmail.endsWith('@wcc.edu.in')) {
    return 'warden'
  }
  if (lowerEmail.startsWith('gatepass.') && lowerEmail.endsWith('@wcc.edu.in')) {
    return 'gatepass'
  }
  if (lowerEmail.startsWith('security.') && lowerEmail.endsWith('@wcc.edu.in')) {
    return 'security'
  }
  if (lowerEmail === 'adminresidents@wcc.edu.in') {
    return 'admin'
  }
  if (lowerEmail.endsWith('@wcc.edu.in')) {
    return 'parent'
  }

  // For test Gmail accounts, check common prefixes
  if (lowerEmail === 'vthirthankar@gmail.com') return 'admin'
  if (lowerEmail === 'ngvt200@gmail.com') return 'parent'
  if (lowerEmail === 'majhaavibushi@gmail.com') return 'hod'
  if (lowerEmail === 'vksresidents@gmail.com') return 'dean'
  if (lowerEmail === 'kasavi643@gmail.com') return 'gatepass'
  if (lowerEmail === 'kaavyasuper@gmail.com') return 'warden'
  if (lowerEmail === 'visakamama@gmail.com') return 'security'

  return null
}

/**
 * Check if a parent email is in the email_allowlist
 * (for parents who need to be pre-authorized)
 */
export const isParentAuthorized = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('email_allowlist')
      .select('email')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Allowlist check error:', error)
      return false
    }

    return !!data
  } catch (err) {
    console.error('❌ Allowlist error:', err)
    return false
  }
}
