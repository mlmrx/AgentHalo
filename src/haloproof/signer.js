import crypto from 'node:crypto';
import { canonicalize } from './canonicalJson.js';
export function signProof(payload, key) {
  const signature = crypto.createHmac('sha256', key.secret).update(canonicalize(payload)).digest('base64url');
  return { alg: 'HMAC-SHA256', kid: key.kid, signature };
}
