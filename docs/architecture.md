# AgentHalo Architecture
AgentHalo is a standalone Personal Trust Field for AI agents.

User → HaloSurface → AgentHalo Gateway → HaloRuntime
- HaloVault
- HaloID
- HaloConsent
- HaloPolicy
- HaloDelegation
- HaloRegistry
- HaloResolver
- HaloConnect
- HaloAudit

Design rule: full vault data never leaves AgentHalo. External calls receive only purpose-bound, audience-bound, consent-approved minimum fields.
