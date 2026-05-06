export const HaloProofKeys = {
  halo: { kid: process.env.HALOPROOF_KID || 'halo-demo-key-1', secret: process.env.HALOPROOF_SECRET || 'demo-change-me' },
  registry: { kid: process.env.REGISTRY_KID || 'registry-demo-key-1', secret: process.env.REGISTRY_PROOF_SECRET || process.env.HALOPROOF_SECRET || 'demo-change-me' }
};
