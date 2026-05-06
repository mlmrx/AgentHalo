# AgentHalo

**Tagline:** The trusted personal presence of your AI agent.

AgentHalo is a developer platform MVP for a **personal agent substrate**: a user-controlled trust layer where private memory, identity, consent, permissions, delegation, and audit history persist independently from any app surface.

> **Core thesis:** Your agent should live where your trust lives, not where your screen lives.

---

## What AgentHalo Demonstrates

- A private **User Vault** for preferences and bounded memory.
- A persistent **Agent Identity** for the personal agent.
- A deterministic **Policy Engine** for safety rules and consent requirements.
- A formal **Consent Flow** with expiring requests.
- Short-lived **Delegation Tokens** (purpose, scope, audience, expiry, constraints).
- **AgentFacts Discovery + Verification** for trusted service-agent selection.
- A constrained **External Agent Call** with minimum necessary data.
- End-to-end **Audit Trail** for explainability and accountability.

---

## What AgentHalo Is Not

- Not another chatbot shell.
- Not a mobile app.
- Not a super app.
- Not a centralized data broker.

---

## Platform Architecture

```text
Access Surfaces (Web / Voice / Phone / Kiosk)
                    |
                    v
         +-----------------------------+
         |       AgentHalo API         |
         |   Orchestration Runtime     |
         +--------------+--------------+
                        |
      +-----------------+------------------+
      |                 |                  |
      v                 v                  v
 User Vault      Consent + Policy   Delegation Service
      |                                     |
      +-----------------+------------------+
                        |
                        v
           Discovery + AgentFacts Verify
                        |
                        v
             Verified External Agents
                        |
                        v
                    Audit Trail
```

---

## End-to-End Demo Flow (Kumbh Medical Camp)

**User input**

`Help my mother find the nearest verified medical camp. She prefers Hindi and less crowded routes.`

**System behavior**

1. `/v1/input` receives request.
2. Runtime classifies intent as `find_nearest_medical_help`.
3. Vault provides minimal context (language + mobility preference).
4. Policy requires consent before location sharing.
5. Consent request is created (10-minute expiry).
6. User approves.
7. Delegation token is minted (short-lived, scoped).
8. AgentFacts for `agent:nanda:kumbh.health-service` are verified.
9. External call is made with minimum necessary data only.
10. User receives privacy-explicit answer.
11. Audit events capture the operation trail.

---

## Repository Layout

```text
apps/
  api/                      FastAPI backend + orchestration runtime
  web/                      Demo landing surface
examples/
  kumbh/                    Mock external health agent
```

---

## Local Development

### Prerequisites
- Docker + Docker Compose

### Run

```bash
docker compose up --build
```

### Endpoints
- Web: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Mock health service docs: `http://localhost:8010/docs`

---

## API Overview

- `POST /v1/input`
- `GET /v1/vault/{user_id}`
- `PUT /v1/vault/{user_id}`
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

---

## Security Posture (MVP)

- No broad permanent tokens.
- Delegation tokens are always short-lived.
- External calls require purpose/scope/audience/expiry.
- Full vault never leaves AgentHalo boundary.
- AgentFacts trust gate before service invocation.
- Auditable records for sensitive actions.

---

## Roadmap

- Passkeys and OIDC integration.
- Verifiable credentials for user and service-agent assertions.
- MCP and A2A adapters.
- NANDA index integration.
- Offline + edge deployment modes.
- Policy engine migration path to OPA/Rego/Cedar.
