from fastapi import FastAPI
app = FastAPI()

@app.post('/document-status')
def doc_status(payload: dict):
    return {"document_type": payload.get("document_type", "id-card"), "status": "in_verification", "next_step": "Visit counter 2 with reference token."}
