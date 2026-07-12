import api from './api'
export const aiService = {
  runAdvisor: () => api.post('/ai/advisor'),
  runSimulator: (inputs) => api.post('/ai/simulate', inputs),
}
