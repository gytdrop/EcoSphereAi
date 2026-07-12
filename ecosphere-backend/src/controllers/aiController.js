const { query } = require('../config/db');
const { computeOverallESGScore } = require('../services/esgScoreService');
const { runESGAdvisor } = require('../services/aiService');
const { runSimulator } = require('../services/simulatorService');

// POST /api/ai/advisor
const advisor = async (req, res, next) => {
  try {
    // Gather all ESG data from DB
    const [scores, envData, socialData, govData] = await Promise.all([
      computeOverallESGScore(),

      query(`
        SELECT 
          COALESCE(SUM(co2_value), 0) AS total_emissions,
          (SELECT department FROM carbon_transactions GROUP BY department ORDER BY SUM(co2_value) DESC LIMIT 1) AS top_emitter,
          (SELECT COUNT(*) FROM sustainability_goals WHERE status = 'active') AS active_goals,
          (SELECT COUNT(*) FROM sustainability_goals WHERE status = 'achieved') AS achieved_goals
        FROM carbon_transactions
        WHERE transaction_date >= NOW() - INTERVAL '30 days'
      `),

      query(`
        SELECT 
          (SELECT COUNT(*) FROM csr_activities WHERE status = 'active') AS active_csr,
          (SELECT COUNT(*) FROM csr_participants) AS total_participants,
          COALESCE((SELECT AVG(completion_rate) FROM training_programs WHERE status != 'cancelled'), 0) AS avg_training,
          (SELECT COUNT(*) FROM csr_activities WHERE status = 'pending') AS pending_csr
        FROM users LIMIT 1
      `),

      query(`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('open','overdue')) AS open_issues,
          COUNT(*) FILTER (WHERE severity = 'critical' AND status != 'resolved') AS critical_issues,
          COUNT(*) FILTER (WHERE severity = 'high' AND status != 'resolved') AS high_issues,
          COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_issues,
          (SELECT COUNT(*) FROM audits WHERE status = 'planned' AND audit_date >= CURRENT_DATE) AS upcoming_audits
        FROM compliance_issues
      `),
    ]);

    const ackResult = await query(`
      SELECT ROUND(
        COUNT(DISTINCT pa.user_id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM users WHERE is_active = TRUE), 0) * 100
      ) AS ack_rate
      FROM policy_acknowledgements pa
      JOIN policies p ON pa.policy_id = p.id WHERE p.status = 'active'
    `);

    const esgData = {
      scores,
      environment: {
        totalEmissions: parseFloat(envData.rows[0].total_emissions).toFixed(2),
        topEmitter: envData.rows[0].top_emitter || 'N/A',
        activeGoals: envData.rows[0].active_goals,
        achievedGoals: envData.rows[0].achieved_goals,
      },
      social: {
        activeCSR: socialData.rows[0].active_csr,
        totalParticipants: socialData.rows[0].total_participants,
        avgTrainingCompletion: parseFloat(socialData.rows[0].avg_training).toFixed(1),
        pendingCSR: socialData.rows[0].pending_csr,
      },
      governance: {
        openIssues: govData.rows[0].open_issues,
        criticalIssues: govData.rows[0].critical_issues,
        highIssues: govData.rows[0].high_issues,
        overdueIssues: govData.rows[0].overdue_issues,
        ackRate: ackResult.rows[0].ack_rate || 0,
        upcomingAudits: govData.rows[0].upcoming_audits,
      },
    };

    const analysis = await runESGAdvisor(esgData);
    res.json({ success: true, data: { analysis, esgData } });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/simulate
const simulate = async (req, res, next) => {
  try {
    const {
      treesPlanted = 0,
      carbonReductionPercent = 0,
      renewableEnergyPercent = 0,
      csrActivitiesAdded = 0,
      employeeTrainingPercent = 0,
      volunteerHours = 0,
      complianceIssuesResolved = 0,
      policiesAcknowledged = 0,
    } = req.body;

    const currentScores = await computeOverallESGScore();

    const result = await runSimulator(currentScores, {
      treesPlanted,
      carbonReductionPercent,
      renewableEnergyPercent,
      csrActivitiesAdded,
      employeeTrainingPercent,
      volunteerHours,
      complianceIssuesResolved,
      policiesAcknowledged,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { advisor, simulate };
