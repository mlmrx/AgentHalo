import { auditStore } from './auditStore.js'; import { nanoid } from 'nanoid';
import { buildEventHash, verifyChain } from './hashChain.js';
export const HaloAudit={
  record:(e)=>{ const previous = [...auditStore].reverse().find((x)=>x.user_id===e.user_id); const base={event_id:`audit_${nanoid(6)}`,...e,previous_event_hash:previous?.event_hash||null,created_at:new Date().toISOString()}; const hashes=buildEventHash(base); const evt={...base,...hashes}; auditStore.push(evt); return evt; },
  byUser:(u)=>auditStore.filter(e=>e.user_id===u),
  byTask:(u,t)=>auditStore.filter(e=>e.user_id===u&&e.task_id===t),
  verifyChain:(u)=>verifyChain(auditStore.filter((e)=>e.user_id===u))
};
