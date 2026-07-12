const { query } = require('../config/db');
const User = require('../models/User');

// GET /api/social/csr
const getCSRActivities = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT ca.*,
             u.name AS created_by_name,
             COUNT(cp.id) AS participant_count,
             EXISTS(SELECT 1 FROM csr_participants WHERE activity_id = ca.id AND user_id = $1) AS has_joined
      FROM csr_activities ca
      LEFT JOIN users u ON ca.created_by = u.id
      LEFT JOIN csr_participants cp ON ca.id = cp.activity_id
      GROUP BY ca.id, u.name
      ORDER BY ca.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/social/csr
const createCSRActivity = async (req, res, next) => {
  try {
    const { title, description, category, start_date, end_date, target_participants, xp_reward } = req.body;
    const result = await query(`
      INSERT INTO csr_activities (title, description, category, start_date, end_date, target_participants, xp_reward, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [title, description, category, start_date, end_date, target_participants || 0, xp_reward || 50, req.user.id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/social/csr/:id/join
const joinCSRActivity = async (req, res, next) => {
  try {
    const activityId = req.params.id;

    // Check activity exists and is approved/active
    const actResult = await query(
      'SELECT * FROM csr_activities WHERE id = $1', [activityId]
    );
    if (!actResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    const activity = actResult.rows[0];
    if (!['approved', 'active'].includes(activity.status)) {
      return res.status(400).json({ success: false, message: 'Activity is not open for participation.' });
    }

    // Insert participant (unique constraint prevents duplicates)
    const insertResult = await query(
      'INSERT INTO csr_participants (activity_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [activityId, req.user.id]
    );

    // Award XP only if newly joined
    if (insertResult.rows.length > 0 && activity.xp_reward) {
      await User.updateXP(req.user.id, activity.xp_reward);
      const gamificationController = require('./gamificationController');
      await gamificationController.checkAndAwardBadges(req.user.id);
    }

    res.json({ success: true, message: 'Successfully joined the CSR activity.', xpEarned: activity.xp_reward });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/social/csr/:id/approve
const approveCSRActivity = async (req, res, next) => {
  try {
    const result = await query(`
      UPDATE csr_activities SET status = 'approved', approved_by = $1, updated_at = NOW()
      WHERE id = $2 RETURNING *
    `, [req.user.id, req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/social/training
const getTrainingPrograms = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM training_programs WHERE status != $1 ORDER BY completion_rate DESC',
      ['cancelled']
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/social/diversity
const getDiversityMetrics = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM diversity_metrics ORDER BY department'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCSRActivities, createCSRActivity, joinCSRActivity,
  approveCSRActivity, getTrainingPrograms, getDiversityMetrics,
};
