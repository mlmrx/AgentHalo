from fastapi import FastAPI, HTTPException
import httpx
from .models import InputReq, UserVault, AgentFacts
from .services.platform import platform

app = FastAPI(title="AgentHalo API")

@app.get('/health')
def health(): return {"ok": True, "product": "AgentHalo", "tagline": "The trusted personal presence of your AI agent."}

@app.get('/v1/vault/{user_id}')
def get_vault(user_id: str):
    if user_id not in platform.vaults: raise HTTPException(404, "vault not found")
    return platform.vaults[user_id]

@app.put('/v1/vault/{user_id}')
def put_vault(user_id: str, body: UserVault):
    platform.vaults[user_id] = body
    return body

@app.post('/v1/policy/evaluate')
def eval_policy(body: dict):
    return platform.evaluate_policy(body.get("purpose", "unknown"), body.get("requested_data", []), body.get("risk", "medium"))

@app.post('/v1/consent/request')
def consent_request(body: dict):
    return platform.create_consent(body["user_id"], body["purpose"])

@app.post('/v1/consent/respond')
def consent_respond(body: dict):
    consent = platform.consents.get(body["consent_id"])
    if not consent: raise HTTPException(404, "consent not found")
    consent.status = "approved" if body.get("approved") else "denied"
    return consent

@app.post('/v1/delegations')
def create_delegation(body: dict):
    token, payload = platform.create_delegation(body["user_id"], body["purpose"], body["audience"])
    return {"token": token, "payload": payload}

@app.post('/v1/discover')
def discover(_body: dict): return {"agents": [platform.agentfacts]}

@app.post('/v1/resolve')
def resolve(body: dict): return {"endpoint": platform.agentfacts.protocols["rest"]["endpoint"], "agent_id": body.get("agent_id")}

@app.post('/v1/agentfacts/verify')
def verify_facts(body: AgentFacts): return {"verified": platform.verify_agentfacts(body)}

@app.get('/v1/agentfacts/{agent_id}')
def get_facts(agent_id: str):
    if platform.agentfacts.agent_id != agent_id: raise HTTPException(404)
    return platform.agentfacts

@app.post('/v1/agent/call')
async def agent_call(body: dict):
    platform.verify_delegation(body["delegation_token"])
    async with httpx.AsyncClient() as client:
        res = await client.post(platform.agentfacts.protocols["rest"]["endpoint"], json=body["payload"])
    return res.json()

@app.get('/v1/audit/{user_id}')
def audit(user_id: str): return [a for a in platform.audit if a.user_id == user_id]

@app.post('/v1/input')
async def input_flow(req: InputReq):
    if req.user_id not in platform.vaults: raise HTTPException(404, "vault not found")
    purpose = "find_nearest_medical_help"
    requested_data = ["approx_location"]
    policy = platform.evaluate_policy(purpose, requested_data)
    if not policy["allowed"]: raise HTTPException(403, policy["reason"])

    if policy.get("requires_consent") and not req.consent_approved:
        consent = platform.create_consent(req.user_id, purpose)
        platform.add_audit(req.user_id, purpose, "consent_requested", "pending", ["approx_location"], platform.agentfacts.agent_id, consent.consent_id)
        return {"status":"consent_required", "consent": consent, "consent_card": "AgentHalo needs permission to share approximate location for 10 minutes with a verified health agent."}

    token, payload = platform.create_delegation(req.user_id, purpose, platform.agentfacts.agent_id)
    if not platform.verify_agentfacts(platform.agentfacts):
        raise HTTPException(403, "agentfacts verification failed")

    vault = platform.vaults[req.user_id]
    outbound = {"approx_location":"sector-4", "language":vault.preferred_language, "preferences":{"avoid_crowds":True}, "delegation_token":token}
    async with httpx.AsyncClient() as client:
        service = (await client.post(platform.agentfacts.protocols["rest"]["endpoint"], json=outbound)).json()

    platform.add_audit(req.user_id, purpose, "external_agent_called", "nearest_camp_returned", ["approx_location"], platform.agentfacts.agent_id, req.consent_id, payload.jti)
    answer = "Medical Camp B is about 600 meters away. Take the Gate 4 route. Avoid Sector 7 because crowd density is high. I used only approximate location and did not share medical history."
    return {"status":"completed", "intent": purpose, "shared": {"approx_location": True, "medical_history": False, "full_vault": False}, "delegation": payload, "service_result": service, "answer": answer}
