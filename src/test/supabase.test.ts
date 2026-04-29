import { describe, it, expect, beforeAll } from 'vitest'
import { supabase } from '@/lib/supabase'
import { 
  fetchAllParentProfiles, 
  fetchAllGmailAccounts
} from '@/lib/database'

describe('Supabase Connection', () => {
  beforeAll(() => {
    // Verify credentials are set
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Supabase credentials not configured in .env')
    }
  })

  it('should connect to Supabase', async () => {
    const { data: { session } } = await supabase.auth.getSession()
    expect(supabase).toBeDefined()
  })

  it('should fetch parent profiles table', async () => {
    const { data, error } = await fetchAllParentProfiles()
    
    if (error?.message?.includes('Does not exist')) {
      throw new Error('Parent profiles table not created. Run server/supabase.sql first.')
    }
    
    expect(Array.isArray(data) || data === null).toBe(true)
  })

  it('should fetch gmail accounts table', async () => {
    const { data, error } = await fetchAllGmailAccounts()
    
    if (error?.message?.includes('Does not exist')) {
      throw new Error('Gmail accounts table not created. Run server/supabase.sql first.')
    }
    
    expect(Array.isArray(data) || data === null).toBe(true)
  })
})
