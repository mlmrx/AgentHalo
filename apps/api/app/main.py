from datetime import datetime, timedelta, timezone
import os, uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import jwt, httpx
from .models import UserVault, ConsentRequest, AgentFacts, AuditEvent

app = FastAPI(title="AgentHalo API")
SECRET = "agenthalo-demo-secret"
ALGO = "HS256"

VAULT = {
    "user_123": UserVault(
        user_id="user_123", display_name="Mahesh", preferred_language="hi-IN",
        location_policy={"default_precision":"approximate", "requires_consent":True},
        medical_policy={"share_medical_data":"explicit_consent_only"},
        spending_policy={"max_without_confirmation":0,"currency":"INR"},
        emergency_contacts=[{"name":"Family Contact","relationship":"family","phone":"+91XXXXXXXXXX"}],
        memory=[{"key":"mobility","value":"prefers less crowded routes"}]
    )
}
CONSENTS = {}
AUDIT = []
AGENT = AgentFacts(agent_id="agent:nanda:kumbh.health-service", name="Kumbh Health Assistance Agent", operator={"name":"Official Kumbh Health Authority","did":"did:web:kumbh.example.gov"}, agent_type="public_service.health", capabilities=[{"id":"nearest_medical_camp","risk_level":"low"}], protocols={"rest":{"endpoint":os.getenv("MOCK_HEALTH_ENDPOINT", "http://localhost:8010/nearest-medical-camp")}}, trust={"assurance_level":"government_verified","status":"active"}, privacy={"data_retention":"task_scoped","stores_user_data":False}, signature={"type":"local-demo-signature","value":"signature-placeholder"})

class InputReq(BaseModel):
    user_id: str = "user_123"
    text: str
    consent_approved: bool = False

@app.get('/health')
def health(): return {"ok": True, "product": "AgentHalo"}

@app.get('/v1/vault/{user_id}')
def get_vault(user_id: str):
    if user_id not in VAULT: raise HTTPException(404)
    return VAULT[user_id]

@app.put('/v1/vault/{user_id}')
def put_vault(user_id: str, body: UserVault):
    VAULT[user_id] = body
    return body

@app.post('/v1/agentfacts/verify')
def verify_agentfacts(body: AgentFacts):
    ok = body.trust.get("status") == "active" and body.trust.get("assurance_level") in ["government_verified", "partner_verified"]
    return {"verified": ok}

@app.get('/v1/agentfacts/{agent_id}')
def get_agentfacts(agent_id: str):
    if agent_id != AGENT.agent_id: raise HTTPException(404)
    return AGENT

@app.get('/v1/audit/{user_id}')
def get_audit(user_id: str):
    return [a for a in AUDIT if a.user_id == user_id]

@app.post('/v1/input')
async def input_flow(req: InputReq):
    vault = VAULT[req.user_id]
    intent = "find_nearest_medical_help"
    purpose = intent
    needs_location = True
    if needs_location and vault.location_policy.get("requires_consent") and not req.consent_approved:
        cid = f"consent_{uuid.uuid4().hex[:6]}"
        consent = ConsentRequest(consent_id=cid, user_id=req.user_id, purpose=purpose, requested_data=[{"type":"location","precision":"approximate","duration_minutes":10}], requested_actions=["query_verified_health_agent"], status="pending", created_at=datetime.now(timezone.utc), expires_at=datetime.now(timezone.utc)+timedelta(minutes=10))
        CONSENTS[cid] = consent
        return {"status":"consent_required", "consent":consent, "message":"Share approximate location for 10 minutes with verified Kumbh Health Assistance Agent?"}

    if AGENT.trust["status"] != "active": raise HTTPException(403, "untrusted agent")
    token_payload = {
        "iss":"agenthalo.local", "sub":req.user_id, "actor":f"agenthalo:{req.user_id}:personal", "aud":AGENT.agent_id,
        "scope":["share:approx_location","read:medical_camp_directory"], "purpose":purpose,
        "iat":int(datetime.now(timezone.utc).timestamp()), "exp":int((datetime.now(timezone.utc)+timedelta(minutes=10)).timestamp()), "jti":f"delegation_{uuid.uuid4().hex[:8]}"
    }
    token = jwt.encode(token_payload, SECRET, algorithm=ALGO)
    outbound = {"approx_location":"sector-4", "language":vault.preferred_language, "preferences":{"avoid_crowds":True}, "delegation_token":token}
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(AGENT.protocols["rest"]["endpoint"], json=outbound)
    service = resp.json()
    answer = "Medical Camp B is about 600 meters away. Take the Gate 4 route. Avoid Sector 7 because crowd density is high. I used only approximate location and did not share medical history."
    AUDIT.append(AuditEvent(event_id=f"audit_{uuid.uuid4().hex[:6]}", user_id=req.user_id, agent_id=f"agenthalo:{req.user_id}:personal", event_type="external_agent_called", purpose=purpose, data_shared=["approx_location"], target_agent=AGENT.agent_id, delegation_id=token_payload["jti"], result="nearest_camp_returned", timestamp=datetime.now(timezone.utc)))
    return {"status":"completed", "intent":intent, "token":token, "shared":{"approx_location":"sector-4","medical_history_shared":False}, "service_result":service, "answer":answer}
