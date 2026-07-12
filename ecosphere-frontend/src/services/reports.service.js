import api from './api'
export const reportsService = {
  getESGReport: () => api.get('/reports/esg'),
}
