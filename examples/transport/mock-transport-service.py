from fastapi import FastAPI
app = FastAPI()

@app.post('/nearest-shuttle')
def nearest_shuttle(payload: dict):
    return {"shuttle_stop": "Transit Hub C", "eta_minutes": 6, "route": "Green Loop", "advisory": "Use east barricade corridor"}
