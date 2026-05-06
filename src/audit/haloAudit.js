import { auditStore } from './auditStore.js'; import { nanoid } from 'nanoid';
export const HaloAudit={
  record:(e)=>{ const evt={eventId:`audit_${nanoid(6)}`,...e,createdAt:new Date().toISOString()}; auditStore.push(evt); return evt; },
  byUser:(u)=>auditStore.filter(e=>e.userId===u),
  byTask:(u,t)=>auditStore.filter(e=>e.userId===u&&e.taskId===t)
};
