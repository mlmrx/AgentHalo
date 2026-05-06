const seen = new Set();
export const ReplayGuard = { checkAndUse: (nonce) => { if (seen.has(nonce)) return false; seen.add(nonce); return true; }, clear:()=>seen.clear() };
