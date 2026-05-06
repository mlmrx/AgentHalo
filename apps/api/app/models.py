from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel

class MemoryItem(BaseModel):
    key: str
    value: str

class UserVault(BaseModel):
    user_id: str
    display_name: str
    preferred_language: str
    location_policy: dict
    medical_policy: dict
    spending_policy: dict
    emergency_contacts: list
    memory: List[MemoryItem]

class ConsentRequest(BaseModel):
    consent_id: str
    user_id: str
    purpose: str
    requested_data: list
    requested_actions: list
    status: Literal["pending", "approved", "denied"]
    created_at: datetime
    expires_at: datetime

class AgentFacts(BaseModel):
    agent_id: str
    name: str
    operator: dict
    agent_type: str
    capabilities: list
    protocols: dict
    trust: dict
    privacy: dict
    signature: dict

class AuditEvent(BaseModel):
    event_id: str
    user_id: str
    agent_id: str
    event_type: str
    purpose: str
    data_shared: list
    target_agent: str | None = None
    consent_id: str | None = None
    delegation_id: str | None = None
    result: str
    timestamp: datetime
