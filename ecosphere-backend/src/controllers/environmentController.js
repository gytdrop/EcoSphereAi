const { query } = require('../config/db');
const { computeEnvironmentalScore } = require('../services/esgScoreService');

// GET /api/environment/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { department, from, to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (department) { params.push(department); conditions.push(`ct.department = $${params.length}`); }
    if (from)       { params.push(from);       conditions.push(`ct.transaction_date >= $${params.length}`); }
    if (to)         { params.push(to);         conditions.push(`ct.transaction_date <= $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit, offset);
    const result = await query(`
      SELECT ct.*, ef.name AS factor_name, ef.unit AS factor_unit,
             u.name AS recorded_by
      FROM carbon_transactions ct
      LEFT JOIN emission_factors ef ON ct.emission_factor_id = ef.id
      LEFT JOIN users u ON ct.user_id = u.id
      ${where}
      ORDER BY ct.transaction_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countResult = await query(
      `SELECT COUNT(*) FROM carbon_transactions ct ${where}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/environment/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { department, emission_factor_id, quantity, transaction_date, notes } = req.body;

    // Get emission factor value
    const efResult = await query('SELECT value FROM emission_factors WHERE id = $1', [emission_factor_id]);
    if (!efResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Emission factor not found.' });
    }
    const emissionFactorValue = efResult.rows[0].value;
    const co2Value = emissionFactorValue * quantity;

    if (co2Value < 0) {
      return res.status(400).json({ success: false, message: 'CO2 value cannot be negative.' });
    }

    const result = await query(`
      INSERT INTO carbon_transactions (user_id, department, emission_factor_id, emission_factor_value, quantity, co2_value, transaction_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [req.user.id, department, emission_factor_id, emissionFactorValue, quantity, co2Value, transaction_date || new Date(), notes]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/environment/factors
const getEmissionFactors = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM emission_factors WHERE is_active = TRUE ORDER BY category, name'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/environment/goals
const getGoals = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT sg.*, u.name AS created_by_name
      FROM sustainability_goals sg
      LEFT JOIN users u ON sg.created_by = u.id
      ORDER BY sg.deadline ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/environment/goals
const createGoal = async (req, res, next) => {
  try {
    const { title, description, target_value, unit, deadline } = req.body;
    const result = await query(`
      INSERT INTO sustainability_goals (title, description, target_value, unit, deadline, created_by)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [title, description, target_value, unit, deadline, req.user.id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/environment/score
const getScore = async (req, res, next) => {
  try {
    const score = await computeEnvironmentalScore();
    res.json({ success: true, score });
  } catch (err) {
    next(err);
  }
};

// GET /api/environment/department-summary
const getDepartmentSummary = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT department, SUM(co2_value) AS total_co2, COUNT(*) AS transaction_count
      FROM carbon_transactions
      WHERE transaction_date >= NOW() - INTERVAL '30 days'
      GROUP BY department
      ORDER BY total_co2 DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions, createTransaction, getEmissionFactors,
  getGoals, createGoal, getScore, getDepartmentSummary,
};
