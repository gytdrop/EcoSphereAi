const { query } = require('../config/db');

// GET /api/governance/policies
const getPolicies = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(`
      SELECT p.*,
             u.name AS created_by_name,
             CASE WHEN pa.id IS NOT NULL THEN TRUE ELSE FALSE END AS acknowledged_by_me
      FROM policies p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN policy_acknowledgements pa ON pa.policy_id = p.id AND pa.user_id = $1
      WHERE p.status = 'active'
      ORDER BY p.effective_date DESC
    `, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/governance/policies
const createPolicy = async (req, res, next) => {
  try {
    const { title, content, category, version, effective_date } = req.body;
    const result = await query(`
      INSERT INTO policies (title, content, category, version, effective_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [title, content, category, version || '1.0', effective_date, req.user.id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/governance/policies/:id/acknowledge
const acknowledgePolicy = async (req, res, next) => {
  try {
    await query(
      'INSERT INTO policy_acknowledgements (policy_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Policy acknowledged successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/governance/compliance
const getComplianceIssues = async (req, res, next) => {
  try {
    // Auto-update overdue status
    await query(`
      UPDATE compliance_issues
      SET status = 'overdue', updated_at = NOW()
      WHERE due_date < CURRENT_DATE AND status IN ('open', 'in_progress')
    `);

    const result = await query(`
      SELECT ci.*,
             u.name AS owner_name,
             u.department AS owner_department
      FROM compliance_issues ci
      LEFT JOIN users u ON ci.owner_id = u.id
      ORDER BY
        CASE ci.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        ci.due_date ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/governance/compliance
const createComplianceIssue = async (req, res, next) => {
  try {
    const { title, description, owner_id, severity, due_date } = req.body;
    const result = await query(`
      INSERT INTO compliance_issues (title, description, owner_id, severity, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [title, description, owner_id, severity || 'medium', due_date, req.user.id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/governance/compliance/:id
const updateComplianceIssue = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const resolvedAt = status === 'resolved' ? 'NOW()' : 'NULL';

    const result = await query(`
      UPDATE compliance_issues
      SET status = $1, notes = COALESCE($2, notes), resolved_at = ${resolvedAt}, updated_at = NOW()
      WHERE id = $3 RETURNING *
    `, [status, notes, req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Issue not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /api/governance/audits
const getAudits = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT a.*, u.name AS created_by_name
      FROM audits a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.audit_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPolicies, createPolicy, acknowledgePolicy,
  getComplianceIssues, createComplianceIssue, updateComplianceIssue,
  getAudits,
};
