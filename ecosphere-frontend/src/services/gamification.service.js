import api from './api'
export const gamificationService = {
  getChallenges: () => api.get('/gamification/challenges'),
  joinChallenge: (id) => api.post(`/gamification/challenges/${id}/join`),
  completeChallenge: (id) => api.post(`/gamification/challenges/${id}/complete`),
  getLeaderboard: () => api.get('/gamification/leaderboard'),
  getBadges: () => api.get('/gamification/badges'),
  getRewards: () => api.get('/gamification/rewards'),
  redeemReward: (id) => api.post(`/gamification/rewards/${id}/redeem`),
}
