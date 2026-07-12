const { query } = require('../config/db');
const User = require('../models/User');

// GET /api/gamification/challenges
const getChallenges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(`
      SELECT c.*,
             uc.status AS my_status,
             uc.joined_at AS my_joined_at
      FROM challenges c
      LEFT JOIN user_challenges uc ON uc.challenge_id = c.id AND uc.user_id = $1
      WHERE c.status = 'active'
      ORDER BY c.xp DESC
    `, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/gamification/challenges/:id/join
const joinChallenge = async (req, res, next) => {
  try {
    const challenge = await query('SELECT * FROM challenges WHERE id = $1', [req.params.id]);
    if (!challenge.rows.length) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    await query(
      'INSERT INTO user_challenges (user_id, challenge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.id]
    );
    res.json({ success: true, message: 'Joined challenge successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/gamification/challenges/:id/complete
const completeChallenge = async (req, res, next) => {
  try {
    const ucResult = await query(
      `UPDATE user_challenges SET status = 'completed', completed_at = NOW()
       WHERE user_id = $1 AND challenge_id = $2 AND status = 'in_progress'
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!ucResult.rows.length) {
      return res.status(400).json({ success: false, message: 'Challenge not found or already completed.' });
    }

    const challenge = await query('SELECT xp FROM challenges WHERE id = $1', [req.params.id]);
    const xpEarned = challenge.rows[0]?.xp || 0;
    await User.updateXP(req.user.id, xpEarned);

    // Check badge eligibility
    await checkAndAwardBadges(req.user.id);

    res.json({ success: true, message: 'Challenge completed!', xpEarned });
  } catch (err) {
    next(err);
  }
};

// GET /api/gamification/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT u.id, u.name, u.department, u.xp, u.role,
             COUNT(DISTINCT ub.badge_id) AS badge_count,
             (COUNT(DISTINCT uc.challenge_id) FILTER (WHERE uc.status = 'completed') + 
              COUNT(DISTINCT cp.activity_id)) AS challenges_completed
      FROM users u
      LEFT JOIN user_badges ub ON ub.user_id = u.id
      LEFT JOIN user_challenges uc ON uc.user_id = u.id
      LEFT JOIN csr_participants cp ON cp.user_id = u.id
      WHERE u.is_active = TRUE
      GROUP BY u.id
      ORDER BY u.xp DESC
      LIMIT 20
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/gamification/badges
const getBadges = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(`
      SELECT b.*,
             CASE WHEN ub.id IS NOT NULL THEN TRUE ELSE FALSE END AS earned,
             ub.earned_at
      FROM badges b
      LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
      ORDER BY b.xp_threshold ASC NULLS LAST
    `, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/gamification/rewards
const getRewards = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM rewards WHERE is_active = TRUE AND stock > 0 ORDER BY points_required ASC'
    );
    const userXP = await query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true, data: result.rows, userXP: userXP.rows[0]?.xp || 0 });
  } catch (err) {
    next(err);
  }
};

// POST /api/gamification/rewards/:id/redeem
const redeemReward = async (req, res, next) => {
  try {
    const reward = await query('SELECT * FROM rewards WHERE id = $1 AND stock > 0', [req.params.id]);
    if (!reward.rows.length) {
      return res.status(404).json({ success: false, message: 'Reward not available.' });
    }
    const r = reward.rows[0];

    const userResult = await query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
    const userXP = userResult.rows[0]?.xp || 0;
    if (userXP < r.points_required) {
      return res.status(400).json({ success: false, message: 'Insufficient XP points.' });
    }

    await query('UPDATE rewards SET stock = stock - 1 WHERE id = $1', [r.id]);
    await query('UPDATE users SET xp = xp - $1 WHERE id = $2', [r.points_required, req.user.id]);
    await query(
      'INSERT INTO reward_redemptions (user_id, reward_id, points_spent) VALUES ($1, $2, $3)',
      [req.user.id, r.id, r.points_required]
    );

    res.json({ success: true, message: `Redeemed: ${r.title}`, pointsSpent: r.points_required });
  } catch (err) {
    next(err);
  }
};

// Internal: check & award XP-based badges
async function checkAndAwardBadges(userId) {
  const userResult = await query('SELECT xp FROM users WHERE id = $1', [userId]);
  const xp = userResult.rows[0]?.xp || 0;

  const badges = await query(
    'SELECT id FROM badges WHERE badge_type = $1 AND xp_threshold <= $2', ['xp', xp]
  );
  for (const badge of badges.rows) {
    await query(
      'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, badge.id]
    );
  }
}

module.exports = {
  getChallenges, joinChallenge, completeChallenge,
  getLeaderboard, getBadges, getRewards, redeemReward, checkAndAwardBadges
};
