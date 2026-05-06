from fastapi.testclient import TestClient
from apps.api.app.main import app, AGENT

client = TestClient(app)

def test_vault_retrieval():
    r = client.get('/v1/vault/user_123')
    assert r.status_code == 200
    assert r.json()['preferred_language'] == 'hi-IN'

def test_consent_required():
    r = client.post('/v1/input', json={"text":"Help my mother find nearest verified medical camp", "consent_approved": False})
    assert r.status_code == 200
    assert r.json()['status'] == 'consent_required'

def test_untrusted_agent_rejected():
    old = AGENT.trust['status']
    AGENT.trust['status'] = 'revoked'
    r = client.post('/v1/input', json={"text":"Help", "consent_approved": True})
    assert r.status_code == 403
    AGENT.trust['status'] = old
