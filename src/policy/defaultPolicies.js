export const defaultPolicies = {
  find_nearest_care: { allowed: true, requiresConsentFields: ['approximate_location', 'medical_constraint'] },
  travel_rebooking_options: { allowed: true, deniedActions: ['purchase'] },
  financial_affordability_check: { allowed: true, localOnly: true }
};
