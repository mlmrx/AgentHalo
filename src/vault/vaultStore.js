export const vaultStore = new Map();

vaultStore.set('user-001', {
  userId: 'user-001',
  displayName: 'Mahesh',
  preferredLanguages: ['en-US', 'hi-IN', 'mr-IN'],
  trustPreferences: { defaultDataSharing: 'minimum-necessary', locationPrecisionDefault: 'approximate', requireConsentForSensitiveData: true, allowBackgroundActions: false },
  personalRules: [
    { id: 'rule-medical-explicit-consent', description: 'Never share medical data without explicit consent.', appliesTo: ['medical', 'health', 'emergency'], effect: 'require_consent' },
    { id: 'rule-money-human-confirmation', description: 'Never spend money without explicit confirmation.', appliesTo: ['payments', 'finance', 'commerce'], effect: 'require_confirmation' }
  ],
  boundedMemory: [
    { key: 'route_preference', value: 'Prefer low-crowd and well-lit routes.', sensitivity: 'low' },
    { key: 'medical_constraint', value: 'Heat sensitive.', sensitivity: 'sensitive' }
  ],
  emergencyContacts: [{ name: 'Family Contact', relationship: 'family', channel: 'sms', value: '+1-000-000-0000' }],
  monthlyBudget: { remaining: 1800 }
});
