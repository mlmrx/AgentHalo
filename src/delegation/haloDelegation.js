import { nanoid } from 'nanoid';
import { signProof } from '../haloproof/signer.js';
import { verifyProof } from '../haloproof/verifier.js';
import { HaloProofKeys } from '../haloproof/keys.js';
import { RevocationRegistry } from '../haloproof/revocation.js';

const grants = new Map();
export const HaloDelegation = {
  grant({ subject, audience, purpose, scope, taskId, consentReceiptId }) {
    const now = Date.now();
    const grant = {
      grant_id: `grant_${nanoid(6)}`,
      type: 'DelegationGrant', version: '1.0', issuer: 'agenthalo.local', subject,
      actor: `agenthalo:${subject}:personal`, audience, task_id: taskId, purpose, scope,
      constraints: { minimum_necessary: true, max_duration_seconds: 600 }, consent_receipt_id: consentReceiptId,
      issued_at: new Date(now).toISOString(), expires_at: new Date(now + 600000).toISOString(), status: 'active', nonce: nanoid(12)
    };
    grant.proof = signProof(grant, HaloProofKeys.halo);
    grants.set(grant.grant_id, grant);
    return grant;
  },
  verify({ grantId, audience, action }) {
    const g = grants.get(grantId); if (!g) return { valid: false, reason: 'missing' };
    if (!verifyProof({ ...g, proof: undefined }, g.proof, HaloProofKeys.halo)) return { valid: false, reason: 'invalid_signature' };
    if (g.status !== 'active' || new Date(g.expires_at) <= new Date()) return { valid: false, reason: 'expired_or_inactive' };
    if (RevocationRegistry.getByTargetId(grantId)) return { valid: false, reason: 'revoked' };
    if (audience && g.audience !== audience) return { valid: false, reason: 'wrong_audience' };
    if (action && !g.scope.includes(action)) return { valid: false, reason: 'missing_scope' };
    return { valid: true, grant: g };
  },
  revoke({ grantId }) { const g = grants.get(grantId); if (g) g.status = 'revoked'; return g; },
  get: (id) => grants.get(id)
};
