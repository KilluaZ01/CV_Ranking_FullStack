from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import json
from sqlalchemy.orm import Session

app = FastAPI()

# CORS setup to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dummy DB session dependency and models placeholders
def get_db():
    # return your db session here
    pass

@app.post("/compare")
async def compare(job_description: str = Form(...), pdfs: list[UploadFile] = File(...)):
    session_id = str(uuid.uuid4())
    saved_files = []
    results = {"scored": []}

    # Save uploaded files
    for pdf in pdfs:
        cv_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{cv_id}.pdf")
        with open(file_path, "wb") as f:
            f.write(await pdf.read())
        # Dummy scoring and extraction logic here
        results["scored"].append({
            "cv_id": cv_id,
            "name": pdf.filename,
            "total_score": 0.75,  # Dummy score
            "cv_text": "Extracted text here...",
            "matched_keywords": ["Python", "Flask"],
            "matched_summary": "Matched on: Python, Flask"
        })

    # Save session info to DB (mock)
    # session = SessionModel(id=session_id, results=json.dumps(results))
    # db.add(session)
    # db.commit()

    # For demo, just save json to file (optional)
    with open(f"./results_{session_id}.json", "w") as f:
        json.dump(results, f)

    return {"session_id": session_id}


@app.get("/get_results")
def get_results(session_id: str):
    # Retrieve results from DB or file
    try:
        with open(f"./results_{session_id}.json", "r") as f:
            results = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Session results not found")
    return {"results": results}


@app.get("/get_pdf/{cv_id}")
def get_pdf(cv_id: str):
    file_path = os.path.join(UPLOAD_DIR, f"{cv_id}.pdf")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf')
    raise HTTPException(status_code=404, detail="PDF not found")


@app.delete("/delete_cv/{session_id}/{cv_id}")
def delete_cv(session_id: str, cv_id: str):
    # Load results from file (or DB)
    try:
        with open(f"./results_{session_id}.json", "r") as f:
            results = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")

    # Filter out deleted CV
    updated_scored = [cv for cv in results.get("scored", []) if cv.get("cv_id") != cv_id]
    results["scored"] = updated_scored

    # Save updated results
    with open(f"./results_{session_id}.json", "w") as f:
        json.dump(results, f)

    # Delete file
    try:
        os.remove(os.path.join(UPLOAD_DIR, f"{cv_id}.pdf"))
    except FileNotFoundError:
        pass

    return {"status": "deleted"}
