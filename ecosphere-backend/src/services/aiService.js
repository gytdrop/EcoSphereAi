const { client, modelName } = require('../config/openai');

/**
 * AI ESG Advisor Service
 * Constructs a structured prompt with real ESG data and returns
 * a structured JSON analysis from OpenAI.
 * Rule: Never invent organisational data.
 */
async function runESGAdvisor(esgData) {
  const systemPrompt = `You are EcoSphere AI, an enterprise ESG (Environmental, Social, Governance) management system integrated inside an ERP platform.

You function as an intelligent sustainability advisor.

CRITICAL RULES:
- Never invent or fabricate any organisational data or numbers.
- Only use data explicitly provided in the user message.
- If data is insufficient to make a recommendation, clearly state what additional information is required.
- Respond in professional, business-oriented language.
- Always explain your recommendations with clear reasoning.
- Prioritise recommendations by urgency and business impact.

OUTPUT FORMAT (respond with valid JSON only):
{
  "summary": "Executive summary of the organisation's ESG performance (2-3 sentences)",
  "overallRating": "Excellent | Good | Moderate | Poor | Critical",
  "strengths": ["strength 1", "strength 2"],
  "problems": [
    {
      "area": "Environmental | Social | Governance",
      "issue": "Issue title",
      "detail": "Detailed explanation",
      "impact": "Business impact"
    }
  ],
  "recommendations": [
    {
      "priority": "Critical | High | Medium | Low",
      "area": "Environmental | Social | Governance",
      "action": "Action title",
      "detail": "Detailed recommendation",
      "expectedImpact": "Expected improvement to ESG score or metric"
    }
  ],
  "managementInsight": "One key strategic insight for leadership (1-2 sentences)"
}`;

  const userMessage = `Analyse the following ESG data for our organisation and provide a comprehensive advisory report:

ESG SCORES:
- Overall ESG Score: ${esgData.scores.overall}/100
- Environmental Score: ${esgData.scores.environmental}/100
- Social Score: ${esgData.scores.social}/100
- Governance Score: ${esgData.scores.governance}/100

ENVIRONMENTAL DATA:
- Total CO2 Emissions (last 30 days): ${esgData.environment.totalEmissions} kg CO2
- Active Sustainability Goals: ${esgData.environment.activeGoals}
- Goals Achieved: ${esgData.environment.achievedGoals}
- Top Emitting Department: ${esgData.environment.topEmitter}

SOCIAL DATA:
- Active CSR Activities: ${esgData.social.activeCSR}
- Total CSR Participants: ${esgData.social.totalParticipants}
- Average Training Completion Rate: ${esgData.social.avgTrainingCompletion}%
- Pending CSR Approvals: ${esgData.social.pendingCSR}

GOVERNANCE DATA:
- Open Compliance Issues: ${esgData.governance.openIssues}
- Critical Issues: ${esgData.governance.criticalIssues}
- High Severity Issues: ${esgData.governance.highIssues}
- Overdue Issues: ${esgData.governance.overdueIssues}
- Policy Acknowledgement Rate: ${esgData.governance.ackRate}%
- Upcoming Audits: ${esgData.governance.upcomingAudits}`;

  try {
    if (!client) throw new Error('No AI provider configured.');

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('AI Advisor Error, falling back to deterministic response:', err.message);
    
    // Deterministic fallback based on raw scores
    const overall = esgData.scores.overall;
    const rating = overall >= 80 ? 'Excellent' : overall >= 60 ? 'Good' : overall >= 40 ? 'Moderate' : 'Poor';
    
    return {
      summary: `The organisation is currently performing at a ${rating} level with an overall score of ${overall}/100. Environmental metrics show ${esgData.environment.totalEmissions} kg CO2 emissions, while Governance indicates ${esgData.governance.openIssues} open compliance issues.`,
      overallRating: rating,
      strengths: [
        esgData.scores.social >= 70 ? 'Strong social participation and training engagement' : 'Baseline social policies established',
        esgData.scores.environmental >= 70 ? 'Effective emission tracking and reduction goals' : 'Carbon footprint monitoring is active'
      ],
      problems: [
        ...(esgData.governance.openIssues > 0 ? [{
          area: 'Governance',
          issue: 'Open Compliance Issues',
          detail: `There are ${esgData.governance.openIssues} open issues (${esgData.governance.criticalIssues} critical).`,
          impact: 'Regulatory risk and potential fines'
        }] : []),
        ...(esgData.social.pendingCSR > 0 ? [{
          area: 'Social',
          issue: 'Pending CSR Approvals',
          detail: `There are ${esgData.social.pendingCSR} CSR activities awaiting approval.`,
          impact: 'Delays in community engagement and employee participation'
        }] : [])
      ],
      recommendations: [
        ...(esgData.governance.criticalIssues > 0 ? [{
          priority: 'Critical',
          area: 'Governance',
          action: 'Resolve Critical Compliance Issues',
          detail: 'Immediately assign resources to clear overdue and critical governance tasks.',
          expectedImpact: 'Reduce compliance risk and improve Governance score'
        }] : []),
        {
          priority: 'Medium',
          area: 'Environmental',
          action: 'Review Top Emitters',
          detail: `Investigate the operations of ${esgData.environment.topEmitter} to identify reduction opportunities.`,
          expectedImpact: 'Lower total emissions and boost Environmental score'
        }
      ],
      managementInsight: 'Prioritize resolving open compliance issues to safeguard enterprise reputation before launching new CSR campaigns.'
    };
  }
}

module.exports = { runESGAdvisor };
