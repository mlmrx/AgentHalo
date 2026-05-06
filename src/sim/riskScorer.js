const RULES = { local_only: 5, external_verified_service: 25, external_unverified_service: 80, writes_or_mutations: 25, money_movement: 50, identity_document: 50, exact_location: 25, approximate_location: 10, medical_data: 35, financial_data: 35, child_or_elder_context: 15, long_token_expiry_over_1_hour: 20, no_audit_possible: 50, no_revocation_possible: 40 };

export function scoreRiskPlan(riskPlan) {
  let score = 0; const risk_factors = []; const actions = riskPlan.proposed_actions || [];
  for (const a of actions) {
    if (a.type === 'local_only') { score += RULES.local_only; risk_factors.push({ factor: 'local_only', severity: 'low', reason: 'Task can run locally.' }); }
    if (a.type === 'external_service_call') {
      const val = a.service_verified ? RULES.external_verified_service : RULES.external_unverified_service;
      score += val; risk_factors.push({ factor: 'external_service_call', severity: a.service_verified ? 'medium' : 'high', reason: a.service_verified ? 'External verified service used.' : 'Unverified service requested.' });
    }
    for (const field of [...(a.data_requested || []), ...(a.data_optional || [])]) {
      if (field === 'exact_location') score += RULES.exact_location;
      if (field === 'approximate_location') score += RULES.approximate_location;
      if (/medical/i.test(field)) score += RULES.medical_data;
      if (/financial|bank|account/i.test(field)) score += RULES.financial_data;
      if (/identity_document|passport|id_document/i.test(field)) score += RULES.identity_document;
    }
    if (a.money_movement) score += RULES.money_movement;
    if (a.write_scope) score += RULES.writes_or_mutations;
  }
  const overall_risk = score <= 20 ? 'low' : score <= 50 ? 'medium' : score <= 75 ? 'high' : 'blocked';
  return { risk_score_id: `risk_${riskPlan.plan_id}`, task_id: riskPlan.task_id, plan_id: riskPlan.plan_id, overall_risk, score, risk_factors, mitigations: ['Use approximate location instead of exact location.', 'Remove optional sensitive data.', 'Use verified services only.', 'Require explicit approval before high-risk actions.'] };
}
