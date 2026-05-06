from datetime import datetime, timedelta, timezone
import json, os, uuid
import jwt
from ..models import UserVault, ConsentRequest, DelegationTokenPayload, AgentFacts, AuditEvent, AgentIdentity

SECRET = os.getenv("AGENTHALO_JWT_SECRET", "agenthalo-demo-secret")
ALGO = "HS256"

class Platform:
    def __init__(self):
        self.vaults = {
            "user_123": UserVault(
                user_id="user_123", display_name="Mahesh", preferred_language="hi-IN",
                location_policy={"default_precision":"approximate", "requires_consent":True},
                medical_policy={"share_medical_data":"explicit_consent_only"},
                spending_policy={"max_without_confirmation":0,"currency":"INR"},
                emergency_contacts=[{"name":"Family Contact","relationship":"family","phone":"+91XXXXXXXXXX"}],
                memory=[{"key":"mobility","value":"prefers less crowded routes"}]
            )
        }
        self.identities = {
            "user_123": AgentIdentity(agent_id="agenthalo:user_123:personal", owner_user_id="user_123", display_name="Mahesh's AgentHalo", public_key="demo-public-key", status="active", created_at=datetime.now(timezone.utc))
        }
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        def load(name):
            with open(os.path.join(data_dir, name), "r", encoding="utf-8") as f:
                return AgentFacts(**json.load(f))
        self.agentfacts_catalog = {
            "health": load("agentfacts.health-service.json"),
            "transport": load("agentfacts.transport-service.json"),
            "banking": load("agentfacts.banking-service.json"),
            "government": load("agentfacts.government-service.json")
        }
        self.agentfacts = self.agentfacts_catalog["health"]
        with open(os.path.join(os.path.dirname(__file__), "..", "data", "agentfacts.health-service.json"), "r", encoding="utf-8") as f:
            self.agentfacts = AgentFacts(**json.load(f))
        endpoint = os.getenv("MOCK_HEALTH_ENDPOINT")
        if endpoint:
            self.agentfacts.protocols["rest"]["endpoint"] = endpoint
        self.consents = {}
        self.audit = []

    def discover(self, domain: str | None = None):
        if domain and domain in self.agentfacts_catalog:
            return [self.agentfacts_catalog[domain]]
        return list(self.agentfacts_catalog.values())

    def evaluate_policy(self, purpose: str, requested_data: list[str], risk: str = "medium"):
        if "background_location" in requested_data:
            return {"allowed": False, "reason": "Background location not allowed in MVP"}
        if purpose in ["ambulance_request", "identity_document_share"] or risk == "high":
    def evaluate_policy(self, purpose: str, requested_data: list[str], risk: str = "medium"):
        if "background_location" in requested_data:
            return {"allowed": False, "reason": "Background location not allowed in MVP"}
        if purpose == "ambulance_request" and risk == "high":
            return {"allowed": True, "requires_human_confirmation": True, "requires_consent": True}
        requires_consent = "approx_location" in requested_data
        return {"allowed": True, "requires_consent": requires_consent}

    def create_consent(self, user_id: str, purpose: str):
        cid = f"consent_{uuid.uuid4().hex[:8]}"
        consent = ConsentRequest(consent_id=cid, user_id=user_id, purpose=purpose,
            requested_data=[{"type":"location","precision":"approximate","duration_minutes":10}],
            requested_actions=["query_verified_health_agent"], status="pending",
            created_at=datetime.now(timezone.utc), expires_at=datetime.now(timezone.utc)+timedelta(minutes=10))
        self.consents[cid] = consent
        return consent

    def create_delegation(self, user_id: str, purpose: str, audience: str):
        now = datetime.now(timezone.utc)
        payload = DelegationTokenPayload(
            iss="agenthalo.local", sub=user_id, actor=self.identities[user_id].agent_id, aud=audience,
            scope=["share:approx_location", "read:medical_camp_directory"], purpose=purpose,
            constraints={"max_duration_minutes":10, "share_location_precision":"approximate", "no_persistent_storage_by_receiver":True,
                "requires_human_confirmation_for":["share_medical_history", "book_ambulance", "share_identity_document"]},
            iat=int(now.timestamp()), exp=int((now+timedelta(minutes=10)).timestamp()), jti=f"delegation_{uuid.uuid4().hex[:8]}"
        )
        token = jwt.encode(payload.model_dump(), SECRET, algorithm=ALGO)
        return token, payload

    def verify_delegation(self, token: str):
        return jwt.decode(token, SECRET, algorithms=[ALGO], options={"require": ["exp", "aud", "purpose"]})

    def verify_agentfacts(self, facts: AgentFacts):
        return facts.trust.get("status") == "active" and facts.trust.get("assurance_level") in ["government_verified", "partner_verified"]

    def add_audit(self, user_id: str, purpose: str, event_type: str, result: str, data_shared=None, target_agent=None, consent_id=None, delegation_id=None):
        event = AuditEvent(event_id=f"audit_{uuid.uuid4().hex[:8]}", user_id=user_id, agent_id=self.identities[user_id].agent_id,
            event_type=event_type, purpose=purpose, data_shared=data_shared or [], target_agent=target_agent,
            consent_id=consent_id, delegation_id=delegation_id, result=result, timestamp=datetime.now(timezone.utc))
        self.audit.append(event)
        return event

platform = Platform()
