from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Req(BaseModel):
    approx_location: str
    language: str
    preferences: dict
    delegation_token: str

@app.post('/nearest-medical-camp')
def nearest(req: Req):
    return {
      "camp_name": "Medical Camp B",
      "distance_meters": 600,
      "safe_route": "Gate 4 route",
      "avoid": "Sector 7",
      "reason": "high crowd density",
      "message_hi": "Medical Camp B lagbhag 600 meter door hai. Gate 4 wala route lijiye. Sector 7 se bachkar jaiye kyunki wahan bheed zyada hai."
    }
