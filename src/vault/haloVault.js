import { vaultStore } from './vaultStore.js';
export const HaloVault = {
  getUserVault: (userId) => vaultStore.get(userId),
  updateUserVault: (userId, body) => (vaultStore.set(userId, { ...body, userId }), vaultStore.get(userId)),
  minimumContext(vault, intent) {
    if (intent === 'find_nearest_care') return { preferredLanguages: vault.preferredLanguages, route_preference: vault.boundedMemory.find(x=>x.key==='route_preference')?.value, medical_constraint: vault.boundedMemory.find(x=>x.key==='medical_constraint')?.value };
    if (intent === 'travel_rebooking_options') return { safetyPreference: 'safer-options-only' };
    if (intent === 'financial_affordability_check') return { monthlyBudget: vault.monthlyBudget };
    return {};
  }
};
