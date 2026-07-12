const express = require('express');
const ctrl = require('../controllers/gamificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/challenges', ctrl.getChallenges);
router.post('/challenges/:id/join', ctrl.joinChallenge);
router.post('/challenges/:id/complete', ctrl.completeChallenge);
router.get('/leaderboard', ctrl.getLeaderboard);
router.get('/badges', ctrl.getBadges);
router.get('/rewards', ctrl.getRewards);
router.post('/rewards/:id/redeem', ctrl.redeemReward);

module.exports = router;
