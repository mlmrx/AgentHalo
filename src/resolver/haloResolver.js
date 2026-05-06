import { HaloRegistry } from '../registry/haloRegistry.js';
const byIntent={find_nearest_care:'svc.health.verified.camp',travel_rebooking_options:'svc.travel.verified'};
export const HaloResolver={ resolve:({intent})=>HaloRegistry.get(byIntent[intent]) };
