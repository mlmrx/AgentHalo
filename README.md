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


## HaloSim: Preview Before Permission
Traditional apps ask for permissions once and then quietly operate. AgentHalo does the opposite: it simulates the action first, shows the user what would happen, compares safer paths, and only then asks for consent.

AgentHalo does not ask users to blindly approve agent actions. AgentHalo lets users preview, compare, constrain, approve, and audit agent authority.
