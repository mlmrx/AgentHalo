import test from "node:test";
import assert from "node:assert/strict";
import { runMedicalCampFlow } from "../src/orchestrator.js";

test("returns consent_required when consent not granted", () => {
  const out = runMedicalCampFlow({
    userId: "user-001",
    prompt: "Need medical help",
    eventId: "solstice-festival-2026",
    consentGranted: false
  });

  assert.equal(out.status, "consent_required");
  assert.match(out.consentQuestion, /share your heat-sensitivity/i);
});

test("completes flow with delegation token when consent granted", () => {
  const out = runMedicalCampFlow({
    userId: "user-001",
    prompt: "Where is first aid?",
    eventId: "solstice-festival-2026",
    consentGranted: true
  });

  assert.equal(out.status, "completed");
  assert.equal(out.delegationToken.scope, "task:medical-camp-lookup");
  assert.equal(out.serviceAgentFacts.verificationStatus, "verified");
  assert.match(out.answer, /verified medical support/i);
});
