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
import { ReplayGuard } from '../haloproof/replayGuard.js';

export function processAgentRequest({ userId, prompt, consentDecisions }) {
  const taskId = `task_${Date.now()}`; const intent = planIntent(prompt); const vault = HaloVault.getUserVault(userId);
  if (!HaloPolicy.evaluate({ intent }).allowed) throw new Error('intent denied');
  const ctx = HaloVault.minimumContext(vault, intent); const service = HaloResolver.resolve({ intent });
  if (!service) return composeResponse({ intent, result: { ok: true }, dataShared: [], dataNotShared: ['full_vault'] });
  if (!HaloRegistry.verify(service)) throw new Error('unverified service blocked');
  const consent = HaloConsent.request({ userId, taskId, purpose: intent, audience: service.service_id });
  if (!consentDecisions) return { status:'consent_required', taskId, intent, consent, serviceCard: service };
  const consentOut = HaloConsent.respond({ consentId: consent.consentId, decisions: consentDecisions });
  const grant = HaloDelegation.grant({ subject: userId, audience: service.service_id, purpose: intent, scope: ['share:approximate_location','read:verified_care_locations'], taskId, consentReceiptId: consentOut.receipt.receipt_id });
  const v = HaloDelegation.verify({ grantId: grant.grant_id, audience: service.service_id, action: 'share:approximate_location' });
  if (!v.valid || !ReplayGuard.checkAndUse(grant.nonce)) throw new Error('delegation verification failed');
  const payload = { approximate_location: 'sector-b-approx', language_preference: ctx.language_preference, route_preference: ctx.route_preference };
  const result = HaloConnect.call({ service, payload, delegationGrantId: grant.grant_id });
  HaloAudit.record({ user_id:userId, task_id:taskId, event_type:'delegation_grant_issued', summary:'Issued scoped delegation grant for verified health service.', payload:{grant_id: grant.grant_id} });
  HaloAudit.record({ user_id:userId, task_id:taskId, event_type:'external_service_called', summary:'Called verified service with minimum necessary data only.', payload:{shared:Object.keys(payload)} });
  return { status:'completed', taskId, consentReceipt: consentOut.receipt, delegationGrant: grant, serviceCard: service, response: composeResponse({ intent, result, dataShared:['approximate_location'], dataNotShared:['medical_history','exact_location','identity_documents','full_profile'], verifiedServiceId: service.service_id, delegationGrant: grant, auditPath:`/api/v1/audit/${userId}/chain` }) };
}
