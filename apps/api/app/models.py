from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

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

class AgentIdentity(BaseModel):
    agent_id: str
    owner_user_id: str
    display_name: str
    public_key: str
    status: Literal["active", "disabled"]
    created_at: datetime

class ConsentRequest(BaseModel):
    consent_id: str
    user_id: str
    purpose: str
    requested_data: list
    requested_actions: list
    status: Literal["pending", "approved", "denied"]
    created_at: datetime
    expires_at: datetime

class DelegationTokenPayload(BaseModel):
    iss: str
    sub: str
    actor: str
    aud: str
    scope: list[str]
    purpose: str
    constraints: dict
    iat: int
    exp: int
    jti: str

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
    target_agent: Optional[str] = None
    consent_id: Optional[str] = None
    delegation_id: Optional[str] = None
    result: str
    timestamp: datetime

class InputReq(BaseModel):
    user_id: str = "user_123"
    text: str = Field(min_length=5)
    consent_approved: bool = False
    consent_id: Optional[str] = None
