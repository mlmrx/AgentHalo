from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from unittest.mock import patch
import jwt
from apps.api.app.main import app
from apps.api.app.services.platform import platform, SECRET, ALGO

client = TestClient(app)

class MockResp:
    def json(self):
        return {"camp_name":"Medical Camp B","distance_meters":600,"safe_route":"Gate 4 route","avoid":"Sector 7","reason":"high crowd density"}

async def mock_post(*args, **kwargs):
    return MockResp()

def test_vault_retrieval():
    assert client.get('/v1/vault/user_123').status_code == 200

def test_policy_evaluation():
    res = client.post('/v1/policy/evaluate', json={"purpose":"find_nearest_medical_help","requested_data":["approx_location"]})
    assert res.json()["requires_consent"] is True

def test_consent_required():
    res = client.post('/v1/input', json={"text":"Help my mother find the nearest verified medical camp", "consent_approved":False})
    assert res.json()["status"] == "consent_required"

def test_delegation_token_expiry():
    token, payload = platform.create_delegation("user_123", "find_nearest_medical_help", platform.agentfacts.agent_id)
    decoded = jwt.decode(token, SECRET, algorithms=[ALGO], audience=platform.agentfacts.agent_id)
    assert decoded["exp"] > decoded["iat"]
    expired = jwt.encode({**decoded, "exp": int((datetime.now(timezone.utc)-timedelta(seconds=1)).timestamp())}, SECRET, algorithm=ALGO)
    try:
        platform.verify_delegation(expired)
        assert False
    except Exception:
        assert True

def test_unverified_external_agent_rejected():
    old = platform.agentfacts.trust["status"]
    platform.agentfacts.trust["status"] = "revoked"
    res = client.post('/v1/input', json={"text":"medical help", "consent_approved":True})
    assert res.status_code == 403
    platform.agentfacts.trust["status"] = old

def test_external_call_without_full_vault():
    with patch('httpx.AsyncClient.post', new=mock_post):
        res = client.post('/v1/input', json={"text":"medical help needed", "consent_approved":True})
    body = res.json()
    assert body["status"] == "completed"
    assert body["shared"]["full_vault"] is False

def test_audit_event_created():
    with patch('httpx.AsyncClient.post', new=mock_post):
        client.post('/v1/input', json={"text":"medical help needed", "consent_approved":True})
    assert len(platform.audit) > 0


def test_discover_multiple_verticals():
    res = client.post('/v1/discover', json={})
    assert len(res.json()["agents"]) >= 4
    t = client.post('/v1/discover', json={"domain":"transport"})
    assert t.json()["agents"][0]["agent_type"] == "public_service.transport"

def test_vertical_use_case_catalog():
    res = client.get('/v1/examples/use-cases')
    assert len(res.json()["verticals"]) >= 4
