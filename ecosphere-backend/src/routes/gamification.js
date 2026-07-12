const express = require('express');
const ctrl = require('../controllers/gamificationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('admin', 'hr_manager', 'employee'));

router.get('/challenges', ctrl.getChallenges);
router.post('/challenges/:id/join', ctrl.joinChallenge);
router.post('/challenges/:id/complete', ctrl.completeChallenge);
router.get('/leaderboard', ctrl.getLeaderboard);
router.get('/badges', ctrl.getBadges);
router.get('/rewards', ctrl.getRewards);
router.post('/rewards/:id/redeem', ctrl.redeemReward);

module.exports = router;
