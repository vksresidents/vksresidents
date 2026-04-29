import {
  fetchParentProfileByEmail,
  saveParentProfile,
  fetchAllParentProfiles,
  fetchAllGmailAccounts,
  fetchGmailAccountByRegNo
} from './firebase'

// ============================================================================
// PARENT PROFILES
// ============================================================================

export const fetchParentProfile = async (email: string) => {
  return fetchParentProfileByEmail(email)
}

export const createParentProfile = async (profile: {
  email: string
  parent_name: string
  phone_number: string
  relation: string
  student_reg_no: string
  student_name: string
  student_hostel: string
}) => {
  return saveParentProfile(profile.email, profile)
}

export const updateParentProfile = async (
  email: string,
  updates: Partial<any>
) => {
  return saveParentProfile(email, updates)
}

export const verifyParentProfile = async (email: string) => {
  return saveParentProfile(email, { is_verified: true })
}

// ============================================================================
// GMAIL ACCOUNTS (Admin only)
// ============================================================================

export { fetchAllGmailAccounts, fetchGmailAccountByRegNo }
