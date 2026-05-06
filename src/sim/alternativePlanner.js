import { scoreRiskPlan } from './riskScorer.js';
export function generateAlternativePlans(riskPlan) {
  const base = riskPlan.proposed_actions?.[0] || {};
  const privacyAction = { ...base, data_requested: (base.data_requested || []).filter((f) => f !== 'exact_location'), data_optional: [], write_scope: false };
  if (!privacyAction.data_requested.includes('approximate_location') && (base.data_requested || []).includes('exact_location')) privacyAction.data_requested.push('approximate_location');
  const highContextAction = { ...base };
  const localAction = { ...base, type: 'local_only', target_service_id: 'local://directory', data_optional: [], service_verified: true };
  const alts = [
    { alternative_plan_id: `${riskPlan.plan_id}_alt_privacy`, task_id: riskPlan.task_id, label: 'Privacy-preserving plan', description: 'Shares least sensitive data needed to complete the task.', proposed_actions: [privacyAction] },
    { alternative_plan_id: `${riskPlan.plan_id}_alt_richer`, task_id: riskPlan.task_id, label: 'More personalized plan', description: 'Shares optional context for improved personalization.', proposed_actions: [highContextAction] },
    { alternative_plan_id: `${riskPlan.plan_id}_alt_local`, task_id: riskPlan.task_id, label: 'Local-only plan', description: 'Uses local-only processing when applicable.', proposed_actions: [localAction] }
  ];
  return alts.map((a) => ({ ...a, risk: scoreRiskPlan({ ...riskPlan, plan_id: a.alternative_plan_id, proposed_actions: a.proposed_actions }).overall_risk }));
}
