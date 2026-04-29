import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchParentProfile,
  fetchAllParentProfiles,
  createParentProfile,
  updateParentProfile,
  verifyParentProfile,
  fetchAllGmailAccounts,
  fetchGmailAccountByRegNo
} from '@/lib/database'

// ============================================================================
// PARENT PROFILES
// ============================================================================

export const useParentProfile = (email: string | null) => {
  return useQuery({
    queryKey: ['parentProfile', email],
    queryFn: () => fetchParentProfile(email!),
    enabled: !!email,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useAllParentProfiles = () => {
  return useQuery({
    queryKey: ['allParentProfiles'],
    queryFn: () => fetchAllParentProfiles(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useCreateParentProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createParentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allParentProfiles'] })
    }
  })
}

export const useUpdateParentProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ email, updates }: { email: string; updates: any }) =>
      updateParentProfile(email, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parentProfile', variables.email] })
      queryClient.invalidateQueries({ queryKey: ['allParentProfiles'] })
    }
  })
}

export const useVerifyParentProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: verifyParentProfile,
    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: ['parentProfile', email] })
      queryClient.invalidateQueries({ queryKey: ['allParentProfiles'] })
    }
  })
}

// ============================================================================
// GMAIL ACCOUNTS
// ============================================================================

export const useAllGmailAccounts = () => {
  return useQuery({
    queryKey: ['allGmailAccounts'],
    queryFn: () => fetchAllGmailAccounts(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useGmailAccountByRegNo = (reg_no: string | null) => {
  return useQuery({
    queryKey: ['gmailAccount', reg_no],
    queryFn: () => fetchGmailAccountByRegNo(reg_no!),
    enabled: !!reg_no,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
