import { nanoid } from 'nanoid';
const grants = new Map();
export const HaloDelegation = {
  grant({subject,audience,purpose,scope}){ const now=Date.now(); const g={grantId:`grant_${nanoid(6)}`,issuer:'agenthalo.local',subject,actor:`agenthalo:${subject}:personal`,audience,purpose,scope,constraints:{expiresInSeconds:600,minimumNecessary:true},issuedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString(),status:'active',signature:'demo-signature'}; grants.set(g.grantId,g); return g; },
  verify({grantId}){ const g=grants.get(grantId); return !!g && g.status==='active' && new Date(g.expiresAt)>new Date(); },
  revoke({grantId}){ const g=grants.get(grantId); if(g) g.status='revoked'; return g; },
  get:(id)=>grants.get(id)
};
