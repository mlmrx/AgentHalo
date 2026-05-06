# AgentHalo
## The Personal Trust Field for AI Agents
Your agent should live where your trust lives, not where your screen lives.

Concept by Mahesh Lambe.

## What is AgentHalo?
AgentHalo is a developer-grade reference implementation of a Personal Trust Field for AI agents.

## Why agents need a personal trust field
Agent actions need user-owned authority, policy, consent, minimization, delegation, and auditability across systems.

## What AgentHalo is not
Not an app-first chatbot UX. Not a generic runtime. Not a super app.

## Core thesis
Your agent should live where your trust lives, not where your screen lives.

## Architecture
HaloSurface -> AgentHalo Gateway -> HaloRuntime -> HaloVault, HaloID, HaloPolicy, HaloConsent, HaloDelegation, HaloRegistry, HaloResolver, HaloConnect, HaloAudit.

## Modules
- HaloVault
- HaloID
- HaloConsent
- HaloPolicy
- HaloDelegation
- HaloRegistry
- HaloResolver
- HaloConnect
- HaloAudit

## Demo flows
1. Public Event Health Help
2. Travel Rebooking
3. Financial Check

## API overview
Implements `/health` and `/api/v1/*` trust-field endpoints for vault, policy, consent, delegation, registry, resolution, connect, audit, and agent request.

## Security model
- Full vault never leaves AgentHalo.
- Unverified services blocked.
- Revoked/expired grants fail verification.

## Data minimization model
Only scoped fields approved by consent are shared.

## Consent and delegation model
Consent receipts plus short-lived DelegationGrants with purpose, audience, scope, constraints, and expiry.

## ServiceCard model
Service discovery and verification is based on local ServiceCards.

## Audit model
Append-only HaloAudit trail for intents, policy, consent, delegation, calls, and outcomes.

## Local development
- `npm install`
- `npm test`
- `npm start`

## Tests
Includes unit and flow tests for policy, consent, delegation, registry, resolver, audit, and end-to-end trust behavior.

## Roadmap
- Real passkeys / WebAuthn
- OIDC integration
- Verifiable credentials
- Local-first encrypted vault
- Signed ServiceCards
- Policy engine migration to OPA/Rego or Cedar
- MCP adapter
- A2A adapter
- OpenAPI adapter
- Browser automation adapter
- Edge deployment mode
- Personal cloud sync
- Multi-user support
- Portable AgentHalo account
- Revocation registry
- Trust scoring
- Governance templates for high-trust domains

## Concept by Mahesh Lambe
Your agent should live where your trust lives, not where your screen lives.


## HaloProof
HaloProof is AgentHalo’s signed proof system for consent, delegation, revocation, and auditability. It allows a user, developer, or service to inspect why an agent was allowed to act, what it was allowed to share, which service it called, and whether that authority is still valid.

"AgentHalo does not ask users to blindly trust agent actions. It gives every meaningful action a receipt."

This MVP uses pluggable signing interfaces and currently defaults to HMAC-SHA256 for demonstration, with Ed25519 planned.

AgentHalo is not the agent’s hands.
AgentHalo is not the agent’s brain.
AgentHalo is the agent’s authority layer.
