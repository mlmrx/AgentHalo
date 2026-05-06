import test from 'node:test';
import assert from 'node:assert/strict';
import { processAgentRequest } from '../src/runtime/haloRuntime.js';
import { scoreRiskPlan } from '../src/sim/riskScorer.js';
import { analyzeDataExposure } from '../src/sim/dataExposureAnalyzer.js';
import { generateAlternativePlans } from '../src/sim/alternativePlanner.js';
import { HaloAudit } from '../src/audit/haloAudit.js';

test('simulation is created before consent', () => {
  const out = processAgentRequest({ userId: 'user-001', prompt: 'medical help' });
  assert.equal(out.status, 'trust_preview_required');
  assert.ok(out.simulation_id);
});

test('DataExposureReport includes shared and protected data', () => {
  const report = analyzeDataExposure({ plan_id: 'p1', task_id: 't1', intent: 'find_nearest_care', proposed_actions: [{ capability: 'find_nearest_care', data_requested: ['approximate_location'], data_optional: ['medical_constraint'], target_service_id: 'svc.health.verified.camp' }] });
  assert.ok(report.data_items.length > 0);
  assert.ok(report.blocked_items.length > 0);
});

test('exact location is higher risk than approximate location', () => {
  const a = scoreRiskPlan({ plan_id: 'a', task_id: 't', proposed_actions: [{ type: 'external_service_call', service_verified: true, data_requested: ['approximate_location'] }] });
  const b = scoreRiskPlan({ plan_id: 'b', task_id: 't', proposed_actions: [{ type: 'external_service_call', service_verified: true, data_requested: ['exact_location'] }] });
  assert.ok(b.score > a.score);
});

test('medical and financial data increase risk', () => {
  const base = scoreRiskPlan({ plan_id: 'base', task_id: 't', proposed_actions: [{ type: 'local_only', data_requested: [] }] });
  const med = scoreRiskPlan({ plan_id: 'med', task_id: 't', proposed_actions: [{ type: 'local_only', data_requested: ['medical_constraint'] }] });
  const fin = scoreRiskPlan({ plan_id: 'fin', task_id: 't', proposed_actions: [{ type: 'local_only', data_requested: ['financial_account'] }] });
  assert.ok(med.score > base.score);
  assert.ok(fin.score > base.score);
});

test('alternative planner recommends lower-data plan', () => {
  const alts = generateAlternativePlans({ plan_id: 'plan', task_id: 't', proposed_actions: [{ type: 'external_service_call', data_requested: ['exact_location'], data_optional: ['medical_constraint'], service_verified: true }] });
  const privacy = alts.find((x) => x.label === 'Privacy-preserving plan');
  const richer = alts.find((x) => x.label === 'More personalized plan');
  assert.ok(privacy.proposed_actions[0].data_optional.length === 0);
  assert.ok(richer.proposed_actions[0].data_optional.length >= 0);
});

test('denied optional data is removed from payload and grant scope', () => {
  const phase1 = processAgentRequest({ userId: 'user-001', prompt: 'medical help' });
  const out = processAgentRequest({ userId: 'user-001', prompt: 'medical help', planChoice: phase1.trust_preview.recommended_plan_id, consentDecisions: { approximate_location: true, medical_constraint: false } });
  assert.ok(!('medical_constraint' in out.payload));
  assert.ok(out.delegationGrant.scope.includes('share:approximate_location'));
  assert.ok(!out.delegationGrant.scope.includes('share:medical_constraint'));
});

test('travel do not purchase blocks purchase plan', () => {
  assert.throws(() => processAgentRequest({ userId: 'user-001', prompt: 'My flight is delayed, do not purchase. buy a ticket anyway', planChoice: 'manual', consentDecisions: { explicit_money_confirmation: true } }));
});

test('audit records simulation events before action events', () => {
  const phase1 = processAgentRequest({ userId: 'user-001', prompt: 'medical help' });
  processAgentRequest({ userId: 'user-001', prompt: 'medical help', planChoice: phase1.trust_preview.recommended_plan_id, consentDecisions: { approximate_location: true } });
  const events = HaloAudit.byTask('user-001', phase1.taskId);
  const simIdx = events.findIndex((e) => e.type === 'simulation_created');
  const actionIdx = events.findIndex((e) => e.type === 'plan_selected');
  assert.ok(simIdx >= 0 && actionIdx > simIdx);
});
