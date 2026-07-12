const { client, modelName } = require('../config/openai');

/**
 * Smart ESG Score Simulator
 * Predicts future ESG scores based on proposed actions.
 * Uses OpenAI to explain the predicted changes.
 */

/**
 * Calculate predicted score adjustments purely from inputs (deterministic).
 * The AI then explains the prediction.
 */
function calculatePredictedScores(currentScores, inputs) {
  let envDelta = 0;
  let socialDelta = 0;
  let govDelta = 0;

  // Environmental adjustments
  if (inputs.treesPlanted > 0) envDelta += Math.min(10, inputs.treesPlanted / 50);
  if (inputs.carbonReductionPercent > 0) envDelta += Math.min(15, inputs.carbonReductionPercent * 0.5);
  if (inputs.renewableEnergyPercent > 0) envDelta += Math.min(10, inputs.renewableEnergyPercent * 0.1);

  // Social adjustments
  if (inputs.csrActivitiesAdded > 0) socialDelta += Math.min(10, inputs.csrActivitiesAdded * 2);
  if (inputs.employeeTrainingPercent > 0) socialDelta += Math.min(8, inputs.employeeTrainingPercent * 0.08);
  if (inputs.volunteerHours > 0) socialDelta += Math.min(5, inputs.volunteerHours / 100);

  // Governance adjustments
  if (inputs.complianceIssuesResolved > 0) govDelta += Math.min(15, inputs.complianceIssuesResolved * 4);
  if (inputs.policiesAcknowledged > 0) govDelta += Math.min(5, inputs.policiesAcknowledged * 1);

  const predicted = {
    environmental: Math.min(100, Math.round(currentScores.environmental + envDelta)),
    social:        Math.min(100, Math.round(currentScores.social + socialDelta)),
    governance:    Math.min(100, Math.round(currentScores.governance + govDelta)),
  };

  const weights = currentScores.weights || { environmental: 40, social: 30, governance: 30 };
  predicted.overall = Math.round(
    (predicted.environmental * weights.environmental) / 100 +
    (predicted.social * weights.social) / 100 +
    (predicted.governance * weights.governance) / 100
  );

  return { predicted, deltas: { env: envDelta, social: socialDelta, gov: govDelta } };
}

async function runSimulator(currentScores, inputs) {
  const { predicted, deltas } = calculatePredictedScores(currentScores, inputs);

  const systemPrompt = `You are EcoSphere AI, an enterprise ESG score simulation engine.

You predict how proposed sustainability actions will impact ESG scores.

RULES:
- Only use the data provided. Never invent numbers.
- Explain the impact of each proposed action clearly.
- Use professional, data-driven language.
- Be specific about which score improves and by how much.

OUTPUT FORMAT (valid JSON only):
{
  "summary": "Overall simulation summary (2-3 sentences)",
  "environmentalAnalysis": "Explanation of environmental score change",
  "socialAnalysis": "Explanation of social score change",
  "governanceAnalysis": "Explanation of governance score change",
  "overallImpact": "Summary of total ESG score impact",
  "keyInsight": "Most impactful single action from the proposed inputs",
  "limitations": "Any caveats or data limitations in this prediction"
}`;

  const userMessage = `Simulate the ESG score impact of the following proposed actions:

CURRENT SCORES:
- Environmental: ${currentScores.environmental}/100
- Social: ${currentScores.social}/100
- Governance: ${currentScores.governance}/100
- Overall ESG: ${currentScores.overall}/100

PROPOSED ACTIONS:
- Trees to plant: ${inputs.treesPlanted || 0}
- Carbon reduction target: ${inputs.carbonReductionPercent || 0}%
- Renewable energy increase: ${inputs.renewableEnergyPercent || 0}%
- New CSR activities: ${inputs.csrActivitiesAdded || 0}
- Employee training completion target: ${inputs.employeeTrainingPercent || 0}%
- Volunteer hours committed: ${inputs.volunteerHours || 0}
- Compliance issues to resolve: ${inputs.complianceIssuesResolved || 0}
- Policy acknowledgements to obtain: ${inputs.policiesAcknowledged || 0}

PREDICTED SCORES (calculated by simulator engine):
- Environmental: ${currentScores.environmental} → ${predicted.environmental} (+${deltas.env.toFixed(1)})
- Social: ${currentScores.social} → ${predicted.social} (+${deltas.social.toFixed(1)})
- Governance: ${currentScores.governance} → ${predicted.governance} (+${deltas.gov.toFixed(1)})
- Overall ESG: ${currentScores.overall} → ${predicted.overall}

Provide a professional analysis explaining WHY each score changes and what the business impact is.`;

  if (!client) throw new Error('No AI provider configured. Add GROQ_API_KEY or OPENAI_API_KEY to .env');

  const response = await client.chat.completions.create({
    model: modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 1500,
  });

  const analysis = JSON.parse(response.choices[0].message.content);

  return {
    current: currentScores,
    predicted,
    deltas: {
      environmental: Math.round(deltas.env * 10) / 10,
      social: Math.round(deltas.social * 10) / 10,
      governance: Math.round(deltas.gov * 10) / 10,
      overall: predicted.overall - currentScores.overall,
    },
    analysis,
    inputs,
  };
}

module.exports = { runSimulator };
