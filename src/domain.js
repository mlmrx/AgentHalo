import { nanoid } from "nanoid";

export const EVENT_SERVICES = {
  "solstice-festival-2026": {
    name: "Solstice Festival 2026",
    verifiedServices: [
      {
        serviceId: "med-camp-north",
        name: "North Medical Camp",
        locationHint: "Near Gate B and the blue water towers",
        capabilities: ["first-aid", "hydration", "lost-person-protocol"],
        agentFacts: {
          agentId: "svc:medcamp:north:2026",
          organization: "City Emergency Collaborative",
          verificationIssuer: "EventTrust Registry",
          verificationStatus: "verified",
          signedAt: "2026-05-01T10:00:00Z",
          expiresAt: "2026-06-01T00:00:00Z",
          trustLevel: "high"
        }
      }
    ]
  }
};

export const USER_VAULT = {
  "user-001": {
    userId: "user-001",
    displayName: "Alex Rivera",
    emergencyProfile: {
      accessibilityNotes: "Prefers low-crowd route",
      medicalFlags: ["heat-sensitive"],
      contactPreference: "sms"
    },
    consentPolicies: {
      shareMedicalFlagsWithVerifiedMedicalOnly: true,
      requiresConsentForMedicalDisclosure: true
    }
  }
};

export const POLICY = {
  minimumNecessaryFields: {
    medicalCampLookup: ["medicalFlags", "accessibilityNotes"]
  },
  delegation: {
    ttlSeconds: 300,
    scope: "task:medical-camp-lookup"
  }
};

export function planTask({ userPrompt, eventId }) {
  const intent = /medical|first aid|clinic|health/i.test(userPrompt)
    ? "medicalCampLookup"
    : "unknown";

  return {
    taskId: `task_${nanoid(8)}`,
    eventId,
    intent,
    userPrompt,
    requestedAt: new Date().toISOString()
  };
}

export function getPrivateContext(userId, intent) {
  const vault = USER_VAULT[userId];
  if (!vault) throw new Error("User vault not found");

  if (intent !== "medicalCampLookup") {
    return { limitedContext: {}, reason: "Intent unsupported" };
  }

  return {
    limitedContext: {
      medicalFlags: vault.emergencyProfile.medicalFlags,
      accessibilityNotes: vault.emergencyProfile.accessibilityNotes
    },
    reason: "Minimum necessary context for safe medical camp guidance"
  };
}

export function evaluatePolicy(userId, intent) {
  const vault = USER_VAULT[userId];
  if (!vault) throw new Error("User vault not found");

  const requiresConsent =
    intent === "medicalCampLookup" &&
    vault.consentPolicies.requiresConsentForMedicalDisclosure;

  return {
    allowed: intent === "medicalCampLookup",
    requiresConsent,
    policyReason: requiresConsent
      ? "Medical disclosure requires explicit user consent"
      : "No additional consent required"
  };
}

export function issueDelegationToken(taskId, userId) {
  const now = Date.now();
  return {
    tokenId: `dtk_${nanoid(10)}`,
    taskId,
    subject: userId,
    scope: POLICY.delegation.scope,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + POLICY.delegation.ttlSeconds * 1000).toISOString()
  };
}

export function discoverAndVerifyService(eventId) {
  const event = EVENT_SERVICES[eventId];
  if (!event) throw new Error("No verified registry for event");
  const service = event.verifiedServices[0];

  const isVerified =
    service.agentFacts.verificationStatus === "verified" &&
    new Date(service.agentFacts.expiresAt).getTime() > Date.now();

  if (!isVerified) throw new Error("Service agent facts card not valid");
  return service;
}

export function callExternalService({ service, limitedContext }) {
  const includesMedicalFlag = limitedContext.medicalFlags?.includes("heat-sensitive");
  const recommendation = includesMedicalFlag
    ? `${service.name} is operating with a shaded intake line and hydration triage.`
    : `${service.name} is open for first-aid support.`;

  return {
    serviceId: service.serviceId,
    recommendation,
    locationHint: service.locationHint,
    etaMinutes: 7,
    confidence: "high"
  };
}

export function humanizeAnswer({ userName, result }) {
  return `${userName}, the closest verified medical support is ${result.serviceId.replace(/-/g, " ")}.
${result.recommendation}
Location: ${result.locationHint}. Approx walk time: ${result.etaMinutes} minutes.`;
}
