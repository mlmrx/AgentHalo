export const serviceCards = [
{ serviceId:'svc.health.verified.camp',name:'Verified Health Assistance Service',category:'health',capabilities:[{id:'find_nearest_care'}],endpoint:{type:'rest',url:'mock://health/find-nearest-care'},trust:{status:'verified',level:'high',expiresAt:'2026-12-31T23:59:59Z'} },
{ serviceId:'svc.travel.verified',name:'Verified Travel Assistance',category:'travel',capabilities:[{id:'travel_rebooking_options'}],endpoint:{type:'rest',url:'mock://travel/rebook'},trust:{status:'verified',level:'high',expiresAt:'2026-12-31T23:59:59Z'} },
{ serviceId:'svc.finance.local',name:'Local Finance Analyzer',category:'finance',capabilities:[{id:'financial_affordability_check'}],endpoint:{type:'local',url:'local://finance'},trust:{status:'verified',level:'high',expiresAt:'2026-12-31T23:59:59Z'} }
];
