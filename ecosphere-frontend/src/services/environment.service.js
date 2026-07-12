import api from './api'
export const environmentService = {
  getTransactions: (params) => api.get('/environment/transactions', { params }),
  createTransaction: (data) => api.post('/environment/transactions', data),
  getFactors: () => api.get('/environment/factors'),
  getGoals: () => api.get('/environment/goals'),
  createGoal: (data) => api.post('/environment/goals', data),
  getDepartmentSummary: () => api.get('/environment/department-summary'),
}
