const { query } = require('../config/db');

/**
 * Compute ESG scores for an organisation.
 * Scores are derived from real DB data.
 * Formula: Overall = (Env × 0.40) + (Social × 0.30) + (Gov × 0.30)
 */

// --- Environmental Score ---
async function computeEnvironmentalScore() {
  // Base: 100. Deduct based on carbon emissions vs goal targets.
  const emissionsResult = await query(`
    SELECT COALESCE(SUM(co2_value), 0) AS total_emissions
    FROM carbon_transactions
    WHERE transaction_date >= NOW() - INTERVAL '30 days'
  `);
  const totalEmissions = parseFloat(emissionsResult.rows[0].total_emissions);

  const goalsResult = await query(`
    SELECT COUNT(*) AS total, 
           SUM(CASE WHEN status = 'achieved' THEN 1 ELSE 0 END) AS achieved
    FROM sustainability_goals
  `);
  const { total, achieved } = goalsResult.rows[0];
  const goalAchievementRate = total > 0 ? (achieved / total) * 100 : 0;

  // Emissions penalty: baseline 5000 kg/month = score 70
  let emissionScore = Math.max(0, 100 - (totalEmissions / 100));
  emissionScore = Math.min(100, emissionScore);

  // Blend with goal achievement
  const environmentalScore = (emissionScore * 0.7) + (goalAchievementRate * 0.3);
  return Math.round(Math.min(100, Math.max(0, environmentalScore)));
}

// --- Social Score ---
async function computeSocialScore() {
  const csrResult = await query(`
    SELECT 
      COUNT(DISTINCT ca.id) AS total_activities,
      COUNT(DISTINCT cp.user_id) AS total_participants
    FROM csr_activities ca
    LEFT JOIN csr_participants cp ON ca.id = cp.activity_id
    WHERE ca.status IN ('active', 'completed')
  `);

  const trainingResult = await query(`
    SELECT COALESCE(AVG(completion_rate), 0) AS avg_completion
    FROM training_programs
    WHERE status != 'cancelled'
  `);

  const { total_activities, total_participants } = csrResult.rows[0];
  const avgTrainingCompletion = parseFloat(trainingResult.rows[0].avg_completion);

  const participationScore = Math.min(100, (total_participants / 10) * 100);
  const activityScore = Math.min(100, total_activities * 15);

  const socialScore = (participationScore * 0.4) + (activityScore * 0.3) + (avgTrainingCompletion * 0.3);
  return Math.round(Math.min(100, Math.max(0, socialScore)));
}

// --- Governance Score ---
async function computeGovernanceScore() {
  // Compliance issues: each open critical = -10, high = -7, medium = -4, low = -2
  const issuesResult = await query(`
    SELECT severity, COUNT(*) AS count
    FROM compliance_issues
    WHERE status IN ('open', 'overdue')
    GROUP BY severity
  `);

  let penalty = 0;
  const deductions = { critical: 10, high: 7, medium: 4, low: 2 };
  for (const row of issuesResult.rows) {
    penalty += (deductions[row.severity] || 0) * parseInt(row.count);
  }

  // Policy acknowledgement rate
  const ackResult = await query(`
    SELECT 
      COUNT(DISTINCT pa.user_id) AS acknowledged_users,
      (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_users
    FROM policy_acknowledgements pa
    JOIN policies p ON pa.policy_id = p.id
    WHERE p.status = 'active'
  `);

  const { acknowledged_users, total_users } = ackResult.rows[0];
  const ackRate = total_users > 0 ? (acknowledged_users / total_users) * 100 : 0;

  const governanceScore = Math.max(0, (100 - penalty) * 0.6 + ackRate * 0.4);
  return Math.round(Math.min(100, Math.max(0, governanceScore)));
}

// --- Overall ESG Score ---
async function computeOverallESGScore() {
  // Get configurable weights
  const weightsResult = await query(
    'SELECT env_weight, social_weight, gov_weight FROM esg_weights ORDER BY id DESC LIMIT 1'
  );
  const weights = weightsResult.rows[0] || { env_weight: 40, social_weight: 30, gov_weight: 30 };

  const [envScore, socialScore, govScore] = await Promise.all([
    computeEnvironmentalScore(),
    computeSocialScore(),
    computeGovernanceScore(),
  ]);

  const overall =
    (envScore * weights.env_weight) / 100 +
    (socialScore * weights.social_weight) / 100 +
    (govScore * weights.gov_weight) / 100;

  return {
    overall: Math.round(overall),
    environmental: envScore,
    social: socialScore,
    governance: govScore,
    weights: {
      environmental: parseFloat(weights.env_weight),
      social: parseFloat(weights.social_weight),
      governance: parseFloat(weights.gov_weight),
    },
  };
}

module.exports = {
  computeEnvironmentalScore,
  computeSocialScore,
  computeGovernanceScore,
  computeOverallESGScore,
};
