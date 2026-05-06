import { serviceCards } from './serviceCards.js';
export const HaloRegistry = {
  list: ()=>serviceCards,
  get: (serviceId)=>serviceCards.find(s=>s.serviceId===serviceId),
  verify: (service)=>service?.trust?.status==='verified' && new Date(service.trust.expiresAt)>new Date()
};
