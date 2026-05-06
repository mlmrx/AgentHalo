import test from 'node:test';
import assert from 'node:assert/strict';
import { processAgentRequest } from '../src/runtime/haloRuntime.js';
import { HaloDelegation } from '../src/delegation/haloDelegation.js';
import { HaloRegistry } from '../src/registry/haloRegistry.js';

test('denied consent blocks execution', () => {
  assert.throws(() => processAgentRequest({ userId: 'user-001', prompt: 'medical help', consentDecisions: { approximate_location: false } }));
});

test('local-only task does not call external services', () => {
  const out = processAgentRequest({ userId: 'user-001', prompt: 'Can I afford this $1,200 purchase this month?' });
  assert.equal(out.verifiedServiceId, null);
  assert.deepEqual(out.dataShared, []);
});

test('revoked grants are rejected', () => {
  const grant = HaloDelegation.grant({ subject: 'user-001', audience: 'svc.health.verified.camp', purpose: 'find_nearest_care', scope: ['share:approximate_location'] });
  HaloDelegation.revoke({ grantId: grant.grantId });
  assert.equal(HaloDelegation.verify({ grantId: grant.grantId }), false);
});

test('expired grants are rejected', () => {
  const grant = HaloDelegation.grant({ subject: 'user-001', audience: 'svc.health.verified.camp', purpose: 'find_nearest_care', scope: ['share:approximate_location'] });
  const stored = HaloDelegation.get(grant.grantId);
  stored.expiresAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(HaloDelegation.verify({ grantId: grant.grantId }), false);
});

test('unverified services are blocked', () => {
  const service = HaloRegistry.get('svc.health.verified.camp');
  service.trust.status = 'revoked';
  assert.equal(HaloRegistry.verify(service), false);
  service.trust.status = 'verified';
});

test('full vault is never sent externally', () => {
  const out = processAgentRequest({ userId: 'user-001', prompt: 'medical help', consentDecisions: { approximate_location: true, medical_constraint: false } });
  const msg = out.response.message;
  assert.match(msg, /Not shared: full_vault/);
});

test('final response contains trust disclosure fields', () => {
  const out = processAgentRequest({ userId: 'user-001', prompt: 'medical help', consentDecisions: { approximate_location: true, medical_constraint: false } });
  assert.ok(out.response.message.includes('Shared:'));
  assert.ok(out.response.message.includes('Not shared:'));
  assert.ok(out.response.message.includes('Verified service:'));
  assert.ok(out.response.message.includes('Permission expires:'));
  assert.ok(out.response.message.includes('Audit trail:'));
});
