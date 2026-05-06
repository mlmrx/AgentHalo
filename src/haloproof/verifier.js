import crypto from 'node:crypto';
import { canonicalize } from './canonicalJson.js';
export function verifyProof(payload, proof, key) {
  const expected = crypto.createHmac('sha256', key.secret).update(canonicalize(payload)).digest('base64url');
  return proof?.kid === key.kid && proof?.alg === 'HMAC-SHA256' && proof?.signature === expected;
}
