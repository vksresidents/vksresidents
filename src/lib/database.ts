import { supabase } from './supabase'

// ============================================================================
// PARENT PROFILES
// ============================================================================

export const fetchParentProfile = async (email: string) => {
  const { data, error } = await supabase
    .from('parent_profiles')
    .select('*')
    .eq('email', email)
    .single()
  
  return { data, error }
}

export const fetchAllParentProfiles = async () => {
  const { data, error } = await supabase
    .from('parent_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
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
  const { data, error } = await supabase
    .from('parent_profiles')
    .insert([profile])
    .select()
    .single()
  
  return { data, error }
}

export const updateParentProfile = async (email: string, updates: Partial<any>) => {
  const { data, error } = await supabase
    .from('parent_profiles')
    .update({ ...updates, updated_at: new Date() })
    .eq('email', email)
    .select()
    .single()
  
  return { data, error }
}

export const verifyParentProfile = async (email: string) => {
  const { data, error } = await supabase
    .from('parent_profiles')
    .update({ is_verified: true, updated_at: new Date() })
    .eq('email', email)
    .select()
    .single()
  
  return { data, error }
}

// ============================================================================
// GMAIL ACCOUNTS (Admin only)
// ============================================================================

export const fetchAllGmailAccounts = async () => {
  const { data, error } = await supabase
    .from('gmail_accounts')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const fetchGmailAccountByRegNo = async (reg_no: string) => {
  const { data, error } = await supabase
    .from('gmail_accounts')
    .select('*')
    .eq('reg_no', reg_no)
    .single()
  
  return { data, error }
}

export const createGmailAccount = async (account: {
  reg_no: string
  email: string
  password_hash: string
  created_by?: string
}) => {
  const { data, error } = await supabase
    .from('gmail_accounts')
    .insert([account])
    .select()
    .single()
  
  return { data, error }
}

export const updateGmailAccount = async (id: string, updates: Partial<any>) => {
  const { data, error } = await supabase
    .from('gmail_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deactivateGmailAccount = async (id: string) => {
  const { data, error } = await supabase
    .from('gmail_accounts')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
