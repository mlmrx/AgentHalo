import { signProof } from '../haloproof/signer.js';
import { HaloProofKeys } from '../haloproof/keys.js';

const base = [
{ service_id:'svc.health.verified-care', type:'ServiceCard', version:'1.0', name:'Verified Health Assistance Service', operator:'Demo Emergency Health Network', category:'health', capabilities:[{id:'find_nearest_care',description:'Find nearest verified medical assistance location.',risk_level:'medium'}], endpoint:{type:'rest',url:'mock://health/find-nearest-care'}, trust:{status:'verified',level:'high',issuer:'AgentHalo Demo Trust Registry',issued_at:'2026-05-05T00:00:00Z',expires_at:'2026-12-31T23:59:59Z'}, privacy:{retention:'task_scoped',stores_user_data:false,supports_data_minimization:true} }
];
export const serviceCards = base.map((s) => ({ ...s, proof: signProof(s, HaloProofKeys.registry) }));
