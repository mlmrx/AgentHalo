import { nanoid } from 'nanoid'; import { consentStore } from './consentStore.js';
export const HaloConsent = {
  request({ userId, taskId, purpose, audience }) { const c={consentId:`consent_${nanoid(6)}`,userId,taskId,purpose,audience,status:'pending',requestedData:[{field:'approximate_location',reason:'Needed to identify nearby verified help.'},{field:'medical_constraint',reason:'Optional. Improves triage quality.',optional:true}],expiresAt:new Date(Date.now()+600000).toISOString()}; consentStore.set(c.consentId,c); return c; },
  respond({ consentId, decisions }) { const c=consentStore.get(consentId); c.status='approved'; c.decisions=decisions; return c; },
  get: (id)=>consentStore.get(id)
};
