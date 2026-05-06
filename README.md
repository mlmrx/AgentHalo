# AgentHalo

AgentHalo is a user-controlled personal agent layer that separates the agent from any single app by anchoring memory, identity, consent, delegation, and audit in a trusted personal substrate.

## Core idea
**Your agent should live where your trust lives, not where your screen lives.**

## What this demonstrates
- Private vault and user preferences
- Persistent personal agent identity
- Policy + consent workflow
- Short-lived delegation tokens (purpose/scope/audience/expiry)
- AgentFacts discovery and trust verification
- Verified external service invocation with minimum necessary data
- End-to-end audit trail

## What AgentHalo is not
- Not another chatbot
- Not a mobile app
- Not a super app
- Not a centralized data broker

## Architecture
```
             Access Surfaces (web/voice/phone/kiosk)
                              |
                              v
                   +----------------------+
                   |    AgentHalo API     |
                   |  Orchestration Core  |
                   +----------+-----------+
                              |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
  Private Vault        Consent + Policy      Delegation Service
        |                                           |
        +---------------------+---------------------+
                              |
                              v
                 Discovery + AgentFacts Verify
                              |
                              v
                Verified External Service Agents
                              |
                              v
                          Audit Trail
```

## Demo flow (Kumbh medical camp)
User request:
`Help my mother find the nearest verified medical camp. She prefers Hindi and less crowded routes.`

AgentHalo flow:
1. Parse intent (`find_nearest_medical_help`).
2. Retrieve minimum context from vault.
3. Evaluate policy (consent required for approximate location).
4. Create consent request if needed.
5. Issue short-lived delegation token after consent.
6. Discover and verify `agent:nanda:kumbh.health-service` via AgentFacts.
7. Call external service with approximate location + language + crowd preference only.
8. Return user-friendly response with explicit privacy statement.
9. Record audit events.

## Local setup
```bash
docker compose up --build
```
- Web: http://localhost:3000
- API docs: http://localhost:8000/docs
- Mock health service: http://localhost:8010/docs

## API overview
- `POST /v1/input`
- `GET/PUT /v1/vault/{user_id}`
- `POST /v1/policy/evaluate`
- `POST /v1/consent/request`
- `POST /v1/consent/respond`
- `POST /v1/delegations`
- `POST /v1/discover`
- `POST /v1/resolve`
- `POST /v1/agent/call`
- `GET /v1/audit/{user_id}`
- `GET /v1/agentfacts/{agent_id}`
- `POST /v1/agentfacts/verify`

## Security model
- No permanent broad tokens
- Delegation tokens are short-lived and scoped
- External calls require purpose/scope/audience/expiry
- Full vault is never forwarded to external agents
- AgentFacts must pass trust checks before call
- Audit events track sensitive operations

## Roadmap
- Passkeys
- OIDC
- Verifiable credentials
- MCP adapter
- A2A adapter
- NANDA index integration
- Offline mode
- Edge deployment
