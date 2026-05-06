import crypto from 'node:crypto';
import { canonicalize } from '../haloproof/canonicalJson.js';
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
export function buildEventHash(evt) {
  const payload_hash = sha(canonicalize(evt.payload || {}));
  const event_hash = sha(canonicalize({ ...evt, payload_hash }));
  return { payload_hash, event_hash };
}
export function verifyChain(events) {
  for (let i = 0; i < events.length; i++) {
    if (i > 0 && events[i].previous_event_hash !== events[i - 1].event_hash) return false;
    const { event_hash } = buildEventHash({ ...events[i], event_hash: undefined, payload_hash: undefined });
    if (event_hash !== events[i].event_hash) return false;
  }
  return true;
}
