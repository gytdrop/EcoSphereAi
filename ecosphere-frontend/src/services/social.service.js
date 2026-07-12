import api from './api'
export const socialService = {
  getCSR: () => api.get('/social/csr'),
  createCSR: (data) => api.post('/social/csr', data),
  joinCSR: (id) => api.post(`/social/csr/${id}/join`),
  approveCSR: (id) => api.patch(`/social/csr/${id}/approve`),
  getTraining: () => api.get('/social/training'),
  getDiversity: () => api.get('/social/diversity'),
}
