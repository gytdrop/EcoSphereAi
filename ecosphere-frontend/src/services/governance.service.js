import api from './api'
export const governanceService = {
  getPolicies: () => api.get('/governance/policies'),
  createPolicy: (data) => api.post('/governance/policies', data),
  acknowledgePolicy: (id) => api.post(`/governance/policies/${id}/acknowledge`),
  getCompliance: () => api.get('/governance/compliance'),
  createCompliance: (data) => api.post('/governance/compliance', data),
  updateCompliance: (id, data) => api.patch(`/governance/compliance/${id}`, data),
  getAudits: () => api.get('/governance/audits'),
}
