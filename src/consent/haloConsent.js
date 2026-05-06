import { nanoid } from 'nanoid';
import { consentStore } from './consentStore.js';
import { signProof } from '../haloproof/signer.js';
import { HaloProofKeys } from '../haloproof/keys.js';

export const HaloConsent = {
  request({ userId, taskId, purpose, audience }) {
    const c = { consentId: `consent_${nanoid(6)}`, userId, taskId, purpose, audience, status: 'pending', requestedData: [{ field: 'approximate_location', reason: 'Needed to identify nearby verified help.' }, { field: 'medical_history', optional: true }], expiresAt: new Date(Date.now() + 600000).toISOString() };
    consentStore.set(c.consentId, c); return c;
  },
  respond({ consentId, decisions }) {
    const c = consentStore.get(consentId);
    const receipt = { receipt_id: `consent_rcpt_${nanoid(6)}`, type: 'ConsentReceipt', version: '1.0', user_id: c.userId, agent_id: `agenthalo:${c.userId}:personal`, task_id: c.taskId, purpose: c.purpose, audience: c.audience, approved_data: decisions.approximate_location ? [{ field: 'approximate_location', sensitivity: 'medium', duration_seconds: 600 }] : [], denied_data: ['exact_location', 'medical_history', 'identity_documents'], approved_actions: ['query_verified_health_service'], denied_actions: ['request_emergency_transport', 'share_full_profile'], issued_at: new Date().toISOString(), expires_at: c.expiresAt, status: 'active' };
    receipt.proof = signProof(receipt, HaloProofKeys.halo); c.status = 'approved'; c.decisions = decisions; c.receipt = receipt; return c;
  },
  get: (id) => consentStore.get(id)
};
