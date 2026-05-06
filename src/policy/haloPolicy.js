import { defaultPolicies } from './defaultPolicies.js';
export const HaloPolicy = { evaluate: ({ intent }) => defaultPolicies[intent] || { allowed: false } };
