import { planIntent } from './intentPlanner.js';
import { HaloVault } from '../vault/haloVault.js';
import { HaloPolicy } from '../policy/haloPolicy.js';
import { HaloConsent } from '../consent/haloConsent.js';
import { HaloResolver } from '../resolver/haloResolver.js';
import { HaloRegistry } from '../registry/haloRegistry.js';
import { HaloDelegation } from '../delegation/haloDelegation.js';
import { HaloConnect } from '../connect/haloConnect.js';
import { HaloAudit } from '../audit/haloAudit.js';
import { composeResponse } from './responseComposer.js';
import { HaloSim } from '../sim/haloSim.js';
import { simulationStore } from '../sim/simulationStore.js';

export function processAgentRequest({ userId, prompt, planChoice, consentDecisions = {} }) {
  const taskId = `task_${Date.now()}`;
  const intent = planIntent(prompt);
  const vault = HaloVault.getUserVault(userId);
  const policy = HaloPolicy.evaluate({ intent });
  if (!policy.allowed) throw new Error('intent denied');

  const service = intent === 'financial_affordability_check' ? { serviceId: 'local://vault', trust: { status: 'verified' } } : HaloResolver.resolve({ intent });
  const riskPlan = { plan_id: `plan_${Date.now()}`, task_id: taskId, user_id: userId, intent, proposed_actions: [{ action_id: 'act_001', type: intent === 'financial_affordability_check' ? 'local_only' : 'external_service_call', target_service_id: service?.serviceId, capability: intent, service_verified: HaloRegistry.verify(service) || intent === 'financial_affordability_check', data_requested: intent === 'find_nearest_care' ? ['approximate_location', 'language_preference'] : intent === 'travel_rebooking_options' ? ['itinerary_reference'] : ['monthly_budget'], data_optional: intent === 'find_nearest_care' ? ['medical_constraint'] : intent === 'travel_rebooking_options' ? ['hold_seat'] : ['bank_account_summary'], money_movement: /purchase/i.test(prompt), write_scope: /book|purchase|buy/i.test(prompt), requires_consent: true }] };

  const simulation = HaloSim.simulate({ riskPlan, userPrompt: prompt });
  if (!planChoice) return { status: 'trust_preview_required', taskId, simulation_id: simulation.simulation_id, trust_preview: simulation.trustPreview };

  const chosen = simulation.alternatives.find((a) => a.alternative_plan_id === planChoice) || simulation.riskPlan;
  simulationStore.update(simulation.simulation_id, { chosen_plan_id: planChoice, status: planChoice === 'deny' ? 'rejected' : 'approved' });
  if (planChoice === 'deny') { HaloAudit.record({ userId, taskId, type: 'simulation_rejected' }); return { status: 'rejected', taskId }; }

  const chosenAction = chosen.proposed_actions[0];
  if (chosenAction.money_movement && !consentDecisions.explicit_money_confirmation) throw new Error('money movement requires explicit confirmation');
  if (intent === 'travel_rebooking_options' && /do not purchase/i.test(prompt) && chosenAction.money_movement) throw new Error('purchase blocked by policy');
  if (chosenAction.type === 'external_service_call' && !chosenAction.service_verified) { HaloAudit.record({ userId, taskId, type: 'high_risk_plan_blocked' }); throw new Error('unverified service blocked'); }

  const approved = Object.entries(consentDecisions).filter(([, v]) => !!v).map(([k]) => k).filter((x) => chosenAction.data_requested.includes(x) || (chosenAction.data_optional || []).includes(x));
  const consent = HaloConsent.request({ userId, taskId, purpose: intent, audience: chosenAction.target_service_id });
  HaloConsent.respond({ consentId: consent.consentId, decisions: consentDecisions });
  const grant = HaloDelegation.grant({ subject: userId, audience: chosenAction.target_service_id, purpose: intent, scope: approved.map((x) => `share:${x}`) });

  const ctx = HaloVault.minimumContext(vault, intent);
  if (chosenAction.type === 'local_only') {
    HaloAudit.record({ userId, taskId, type: 'local_only', summary: 'Local-only financial check after simulation.' });
    const result = { affordable: ctx.monthlyBudget.remaining >= 1200 };
    return composeResponse({ intent, result, dataShared: approved, dataNotShared: ['full_vault', ...simulation.dataExposureReport.blocked_items.map((x) => x.field)], verifiedServiceId: null, delegationGrant: grant, auditPath: `/api/v1/audit/${userId}/${taskId}` });
  }

  const payload = Object.fromEntries(approved.map((f) => [f, f === 'approximate_location' ? 'sector-b-approx' : ctx[f] || true]));
  const result = HaloConnect.call({ service: HaloResolver.resolve({ intent }), payload });
  HaloAudit.record({ userId, taskId, type: 'plan_selected', chosenPlanId: planChoice, consentId: consent.consentId, delegationGrantId: grant.grantId, dataShared: approved });
  return { status: 'completed', taskId, consent, delegationGrant: grant, payload, response: composeResponse({ intent, result, dataShared: approved, dataNotShared: simulation.dataExposureReport.blocked_items.map((x) => x.field), verifiedServiceId: chosenAction.target_service_id, delegationGrant: grant, auditPath: `/api/v1/audit/${userId}/${taskId}` }) };
}
