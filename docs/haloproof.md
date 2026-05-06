# HaloProof

## Problem
Agents need verifiable authority.
## Concepts
HaloProof, HaloAudit, ServiceCard, ConsentReceipt, DelegationGrant, RevocationRecord.
## Verification flow
Verify ServiceCard signature + trust, then DelegationGrant signature + scope + audience + expiry + revocation + replay guard.
## API examples
Use `/api/v1/proofs/*`, `/api/v1/delegations/*`, `/api/v1/trust-inspector/*`, `/api/v1/audit/*`.
## Security limitations of MVP
HMAC demo keys only; not production-grade security.
## Production roadmap
Hardware-backed keys, real Ed25519 key management, WebAuthn/passkeys, OIDC integration, verifiable credentials, secure enclave support, encrypted local vault, external trust registry, OPA/Rego or Cedar policy engine.
