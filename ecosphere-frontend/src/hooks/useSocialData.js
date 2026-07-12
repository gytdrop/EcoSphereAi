import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { socialService } from '../services/social.service'

export function useSocialData() {
  const qc = useQueryClient()

  const csrQuery = useQuery({
    queryKey: ['social-csr'],
    queryFn: () => socialService.getCSR().then(r => r.data.data)
  })
  const trainingQuery = useQuery({
    queryKey: ['social-training'],
    queryFn: () => socialService.getTraining().then(r => r.data.data)
  })
  const diversityQuery = useQuery({
    queryKey: ['social-diversity'],
    queryFn: () => socialService.getDiversity().then(r => r.data.data)
  })

  const joinMutation = useMutation({
    mutationFn: socialService.joinCSR,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-csr'] })
  })
  const approveMutation = useMutation({
    mutationFn: socialService.approveCSR,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-csr'] })
  })
  const createMutation = useMutation({
    mutationFn: socialService.createCSR,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['social-csr'] })
  })

  return {
    csr: csrQuery.data || [],
    training: trainingQuery.data || [],
    diversity: diversityQuery.data || [],
    isLoading: csrQuery.isLoading,
    joinMutation,
    approveMutation,
    createMutation
  }
}
