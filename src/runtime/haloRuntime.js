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

export function processAgentRequest({ userId, prompt, consentDecisions }) {
  const taskId = `task_${Date.now()}`;
  const intent = planIntent(prompt);
  const vault = HaloVault.getUserVault(userId);
  const policy = HaloPolicy.evaluate({ intent });
  if (!policy.allowed) throw new Error('intent denied');

  const ctx = HaloVault.minimumContext(vault, intent);
  const auditPath = `/api/v1/audit/${userId}/${taskId}`;

  if (intent === 'financial_affordability_check') {
    const result = { affordable: ctx.monthlyBudget.remaining >= 1200 };
    HaloAudit.record({ userId, taskId, type: 'local_only', summary: 'Local-only affordability check' });
    return composeResponse({ intent, result, dataShared: [], dataNotShared: ['full_vault'], verifiedServiceId: null, delegationGrant: null, auditPath });
  }

  const service = HaloResolver.resolve({ intent });
  if (!HaloRegistry.verify(service)) throw new Error('unverified service blocked');

  const consent = HaloConsent.request({ userId, taskId, purpose: intent, audience: service.serviceId });
  if (!consentDecisions) return { status: 'consent_required', taskId, intent, consent, verifiedServiceId: service.serviceId, auditPath };

  const approved = Object.entries(consentDecisions).filter(([, v]) => v).map(([k]) => k);
  if (!approved.includes('approximate_location')) throw new Error('denied consent blocks execution');

  HaloConsent.respond({ consentId: consent.consentId, decisions: consentDecisions });
  const grant = HaloDelegation.grant({ subject: userId, audience: service.serviceId, purpose: intent, scope: approved.map((x) => `share:${x}`) });
  const payload = { approximate_location: 'sector-b-approx', route_preference: ctx.route_preference };

  const result = HaloConnect.call({ service, payload });
  HaloAudit.record({
    userId,
    taskId,
    type: 'external_service_called',
    summary: 'Called verified service with minimum necessary data',
    consentId: consent.consentId,
    delegationGrantId: grant.grantId,
    targetServiceId: service.serviceId,
    dataShared: approved,
    dataNotShared: ['full_vault', 'medical_history']
  });

  return {
    status: 'completed',
    taskId,
    consent,
    delegationGrant: grant,
    serviceCard: service,
    response: composeResponse({
      intent,
      result,
      dataShared: approved,
      dataNotShared: ['full_vault', 'medical_history'],
      verifiedServiceId: service.serviceId,
      delegationGrant: grant,
      auditPath
    })
  };
}
import { planIntent } from './intentPlanner.js'; import { HaloVault } from '../vault/haloVault.js'; import { HaloPolicy } from '../policy/haloPolicy.js'; import { HaloConsent } from '../consent/haloConsent.js'; import { HaloResolver } from '../resolver/haloResolver.js'; import { HaloRegistry } from '../registry/haloRegistry.js'; import { HaloDelegation } from '../delegation/haloDelegation.js'; import { HaloConnect } from '../connect/haloConnect.js'; import { HaloAudit } from '../audit/haloAudit.js'; import { composeResponse } from './responseComposer.js';
export function processAgentRequest({userId,prompt,consentDecisions}){ const taskId=`task_${Date.now()}`; const intent=planIntent(prompt); const vault=HaloVault.getUserVault(userId); const policy=HaloPolicy.evaluate({intent}); if(!policy.allowed) throw new Error('intent denied'); const ctx=HaloVault.minimumContext(vault,intent); if(intent==='financial_affordability_check'){ const result={affordable:ctx.monthlyBudget.remaining>=1200}; HaloAudit.record({userId,taskId,type:'local_only',summary:'Local-only affordability check'}); return composeResponse({intent,result,dataShared:[],dataNotShared:['full_vault']}); }
 const service=HaloResolver.resolve({intent}); if(!HaloRegistry.verify(service)) throw new Error('unverified service blocked');
 const consent=HaloConsent.request({userId,taskId,purpose:intent,audience:service.serviceId}); if(!consentDecisions) return {status:'consent_required',taskId,intent,consent}; const approved=Object.entries(consentDecisions).filter(([,v])=>v).map(([k])=>k); if(!approved.includes('approximate_location')) throw new Error('denied consent blocks execution'); HaloConsent.respond({consentId:consent.consentId,decisions:consentDecisions}); const grant=HaloDelegation.grant({subject:userId,audience:service.serviceId,purpose:intent,scope:approved.map(x=>`share:${x}`)}); const payload={ approximate_location:'sector-b-approx', route_preference:ctx.route_preference }; const result=HaloConnect.call({service,payload}); HaloAudit.record({userId,taskId,type:'external_service_called',summary:'Called verified service with minimum necessary data',consentId:consent.consentId,delegationGrantId:grant.grantId,targetServiceId:service.serviceId,dataShared:approved,dataNotShared:['full_vault','medical_history']}); return {status:'completed',taskId,consent,delegationGrant:grant,serviceCard:service,response:composeResponse({intent,result,dataShared:approved,dataNotShared:['full_vault','medical_history']})}; }
