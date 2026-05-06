# AgentHalo

AgentHalo is a developer MVP for a personal AI agent layer.

## Core idea
Your agent should live where your trust lives, not where your screen lives.

## What this demonstrates
- Private vault
- Agent identity
- Consent flow
- Delegation token
- AgentFacts
- Discovery and resolution
- External agent call
- Audit trail

## What AgentHalo is not
- Not another chatbot
- Not a mobile app
- Not a super app
- Not a centralized data broker

## Architecture
```
[Web Access Surface] -> [AgentHalo API Orchestrator]
                             |-> [Vault + Policy + Consent]
                             |-> [Delegation Token Service]
                             |-> [AgentFacts Verify + Discovery]
                             |-> [External Verified Agent]
                             |-> [Audit Trail]
```

## Demo
Input: "Help my mother find the nearest verified medical camp. She prefers Hindi and less crowded routes."

Flow: request -> policy -> consent -> delegation -> discovery -> verify -> external call -> privacy-preserving answer -> audit.

## Local setup
```bash
docker compose up --build
```
- Web: http://localhost:3000
- API docs: http://localhost:8000/docs
- Mock health: http://localhost:8010/docs

## API overview
- `POST /v1/input`
- `GET /v1/vault/{user_id}` and `PUT /v1/vault/{user_id}`
- `GET /v1/audit/{user_id}`
- `GET /v1/agentfacts/{agent_id}` and `POST /v1/agentfacts/verify`

## Security model
- Consent required for approximate location sharing in this flow
- No full vault passed to external services
- Short-lived delegation token (10 min expiry)
- External agents must be active + government/partner verified
- Audit event recorded for external call

## Roadmap
- Passkeys
- OIDC
- Verifiable credentials
- MCP adapter
- A2A adapter
- NANDA Index integration
- Offline mode
- Edge deployment
