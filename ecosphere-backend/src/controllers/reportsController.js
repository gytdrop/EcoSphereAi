const { query } = require('../config/db');
const { computeOverallESGScore } = require('../services/esgScoreService');

// GET /api/reports/esg
const getESGReport = async (req, res, next) => {
  try {
    const [scores, emissionsByDept, csrSummary, complianceSummary, topBadgeEarners, goalsSummary] =
      await Promise.all([
        computeOverallESGScore(),

        query(`
          SELECT department, SUM(co2_value) AS total_co2, COUNT(*) AS transactions
          FROM carbon_transactions
          WHERE transaction_date >= NOW() - INTERVAL '3 months'
          GROUP BY department ORDER BY total_co2 DESC
        `),

        query(`
          SELECT ca.category, COUNT(*) AS activity_count, SUM(cp_count.participants) AS total_participants
          FROM csr_activities ca
          LEFT JOIN (
            SELECT activity_id, COUNT(*) AS participants FROM csr_participants GROUP BY activity_id
          ) cp_count ON cp_count.activity_id = ca.id
          GROUP BY ca.category
        `),

        query(`
          SELECT 
            COUNT(*) AS total_issues,
            COUNT(*) FILTER (WHERE status = 'resolved') AS resolved,
            COUNT(*) FILTER (WHERE status IN ('open','overdue')) AS open,
            COUNT(*) FILTER (WHERE status = 'overdue') AS overdue
          FROM compliance_issues
        `),

        query(`
          SELECT u.name, u.department, u.xp, COUNT(ub.id) AS badges
          FROM users u
          LEFT JOIN user_badges ub ON ub.user_id = u.id
          GROUP BY u.id ORDER BY u.xp DESC LIMIT 5
        `),

        query(`
          SELECT title, target_value, current_value, unit, status, deadline
          FROM sustainability_goals ORDER BY deadline ASC
        `),
      ]);

    const emissionTrend = await query(`
      SELECT TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon YYYY') AS month,
             SUM(co2_value) AS total
      FROM carbon_transactions
      WHERE transaction_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', transaction_date)
      ORDER BY DATE_TRUNC('month', transaction_date)
    `);

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        scores,
        emissionsByDept: emissionsByDept.rows,
        emissionTrend: emissionTrend.rows,
        csrSummary: csrSummary.rows,
        complianceSummary: complianceSummary.rows[0],
        topBadgeEarners: topBadgeEarners.rows,
        goalsSummary: goalsSummary.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getESGReport };
