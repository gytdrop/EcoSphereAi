import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { environmentService } from '../services/environment.service'

export function useEnvironmentalData() {
  const qc = useQueryClient()

  const txQuery = useQuery({
    queryKey: ['env-transactions'],
    queryFn: () => environmentService.getTransactions().then(r => r.data),
  })

  const factorsQuery = useQuery({
    queryKey: ['env-factors'],
    queryFn: () => environmentService.getFactors().then(r => r.data.data),
  })

  const goalsQuery = useQuery({
    queryKey: ['env-goals'],
    queryFn: () => environmentService.getGoals().then(r => r.data.data),
  })

  const deptQuery = useQuery({
    queryKey: ['env-dept'],
    queryFn: () => environmentService.getDepartmentSummary().then(r => r.data.data),
  })

  const createTransaction = useMutation({
    mutationFn: environmentService.createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['env-transactions'] })
      qc.invalidateQueries({ queryKey: ['env-dept'] })
    },
  })

  return {
    transactions: txQuery.data?.data || [],
    isLoading: txQuery.isLoading,
    factors: factorsQuery.data || [],
    goals: goalsQuery.data || [],
    deptSummary: deptQuery.data || [],
    createTransaction
  }
}
