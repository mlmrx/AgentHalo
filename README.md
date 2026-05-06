# AgentHalo

**Tagline:** The trusted personal presence of your AI agent.

AgentHalo is a developer MVP for a personal AI agent layer where trust, consent, delegation, and memory are anchored in a user-controlled substrate—not in any single UI surface.

## Core thesis

> Your agent should live where your trust lives, not where your screen lives.

## Architecture demo highlights

The MVP simulates a real orchestration path for a verified-service request (e.g., medical camp discovery at a public event):

1. Understands user request intent.
2. Retrieves minimum private context from a user vault.
3. Runs policy checks.
4. Requests consent for sensitive disclosure.
5. Issues short-lived delegation token.
6. Discovers a verified external service agent.
7. Verifies AgentFacts card validity.
8. Calls external service with minimum necessary data.
9. Returns human-friendly response.
10. Writes immutable-style audit events.

## Tech stack

- Node.js + Express backend
- Static web UI for demo interaction
- JSONL audit log as append-only event trace
- Built-in test coverage using Node test runner

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000.

## API endpoints

- `POST /api/agent/request`
  - Body: `{ userId?, prompt, eventId?, consentGranted? }`
  - Returns either:
    - `status: "consent_required"` with consent question, or
    - `status: "completed"` with delegation token, verified service facts, and answer.
- `GET /api/audit`
  - Returns recent audit events.
- `GET /health`

## Example request

```bash
curl -X POST http://localhost:3000/api/agent/request \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"I feel overheated. Where is the verified medical camp?"}'
```
