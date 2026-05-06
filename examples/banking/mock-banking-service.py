from fastapi import FastAPI
app = FastAPI()

@app.post('/payment-intent')
def payment(payload: dict):
    return {"status": "human_confirmation_required", "max_without_confirmation": 0, "message": "Payment blocked pending explicit approval."}
