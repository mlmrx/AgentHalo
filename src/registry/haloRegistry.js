import { serviceCards } from './serviceCards.js';
import { verifyProof } from '../haloproof/verifier.js';
import { HaloProofKeys } from '../haloproof/keys.js';
export const HaloRegistry = {
  list:()=>serviceCards,
  get:(id)=>serviceCards.find(s=>s.service_id===id),
  verify:(service)=> !!service && service.trust.status==='verified' && verifyProof({...service,proof:undefined}, service.proof, HaloProofKeys.registry)
};
