import type { Role } from '@/types/domain'

/**
 * Detect user role from email address based on WCC naming convention
 * Email patterns:
 * - hod.*@wcc.edu.in → HOD
 * - dean.*@wcc.edu.in → Dean
 * - warden.*@wcc.edu.in → Warden
 * - gatepass.*@wcc.edu.in → GatePass
 * - security.*@wcc.edu.in → Security
 * - adminresidents@wcc.edu.in → Admin
 * - Anything else → Parent (if authorized)
 */
export const getRoleFromEmail = (email: string): Role | null => {
  if (!email) return null

  const lowerEmail = email.toLowerCase()

  // Check for specific patterns
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

  // Default to parent for any other @wcc.edu.in email
  if (lowerEmail.endsWith('@wcc.edu.in')) {
    return 'parent'
  }

  // Unknown domain - return null (not authorized)
  return null
}

/**
 * Get display name for role
 */
export const getRoleDisplayName = (role: Role): string => {
  const names: Record<Role, string> = {
    parent: 'Parent',
    dean: 'Dean',
    hod: 'Head of Department',
    warden: 'Warden',
    gatepass: 'Gate Pass Faculty',
    security: 'Security',
    admin: 'Administrator'
  }
  return names[role] || role
}
