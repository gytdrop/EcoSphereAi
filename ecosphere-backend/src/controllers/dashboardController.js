const { query } = require('../config/db');
const { computeOverallESGScore } = require('../services/esgScoreService');
const User = require('../models/User');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [scores, leaderboard, recentTransactions, complianceStats, csrStats, emissionTrend] =
      await Promise.all([
        computeOverallESGScore(),
        User.getLeaderboard(5),

        // Recent carbon transactions
        query(`
          SELECT ct.*, ef.name AS factor_name
          FROM carbon_transactions ct
          LEFT JOIN emission_factors ef ON ct.emission_factor_id = ef.id
          ORDER BY ct.created_at DESC LIMIT 5
        `),

        // Compliance issue counts
        query(`
          SELECT 
            COUNT(*) FILTER (WHERE status IN ('open','overdue')) AS open_issues,
            COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_issues,
            COUNT(*) FILTER (WHERE severity = 'critical' AND status != 'resolved') AS critical_issues
          FROM compliance_issues
        `),

        // CSR activity stats
        query(`
          SELECT 
            COUNT(*) FILTER (WHERE status = 'active') AS active_csr,
            COUNT(DISTINCT cp.user_id) AS total_participants
          FROM csr_activities ca
          LEFT JOIN csr_participants cp ON ca.id = cp.activity_id
        `),

        // Monthly emissions trend (last 6 months)
        query(`
          SELECT 
            TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon YYYY') AS month,
            SUM(co2_value) AS total_emissions
          FROM carbon_transactions
          WHERE transaction_date >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', transaction_date)
          ORDER BY DATE_TRUNC('month', transaction_date)
        `),
      ]);

    res.json({
      success: true,
      data: {
        scores,
        leaderboard,
        recentTransactions: recentTransactions.rows,
        compliance: complianceStats.rows[0],
        csr: csrStats.rows[0],
        emissionTrend: emissionTrend.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
