from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session as DbSession
from typing import List
import os
import uuid
import shutil
from datetime import datetime

from app.models.database import Base, engine, get_db
from app.models.models import Session as SessionModel

app = FastAPI()

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for serving PDFs
app.mount("/pdfs", StaticFiles(directory=UPLOAD_DIR), name="pdfs")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables
Base.metadata.create_all(bind=engine)

# Pipeline function
def run_pipeline(job_desc: str, pdf_paths: List[str], session_id: str) -> List[dict]:
    results = []
    for i, path in enumerate(pdf_paths):
        filename = os.path.basename(path)
        results.append({
            "cv_id": f"cv_{i}",
            "filename": filename,
            "name": filename.replace(".pdf", ""),
            "total_score": round(0.5 + 0.5 * (i / max(len(pdf_paths), 1)), 2),
            "matched_summary": f"Matched skills for {filename}",
            "accepted": False,
            "rejected": False,
            "accepted_date": None,
            "rejected_date": None,
            "pdf_url": f"http://localhost:8000/get_pdf/{session_id}/{filename}"
        })
    return results

# Compare endpoint
@app.post("/compare")
async def compare(
    job_description: str = Form(...),
    session_name: str = Form(None),  # Use session_name for job name
    pdfs: List[UploadFile] = File(...),
    db: DbSession = Depends(get_db),
):
    session_id = str(uuid.uuid4())
    session_path = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_path, exist_ok=True)

    pdf_filenames = []
    for file in pdfs:
        file_location = os.path.join(session_path, file.filename)
        with open(file_location, "wb") as f:
            shutil.copyfileobj(file.file, f)
        pdf_filenames.append(file.filename)

    full_pdf_paths = [os.path.join(session_path, f) for f in pdf_filenames]
    results = run_pipeline(job_description, full_pdf_paths, session_id)

    db_session = SessionModel(
        id=session_id,
        session_name=session_name,  # Store job name here
        job_description=job_description,
        pdf_paths=pdf_filenames,
        results=results,
        timestamp=datetime.utcnow(),
        completed=False
    )
    db.add(db_session)
    db.commit()

    return {"session_id": session_id}

# Get results
@app.get("/get_results")
async def get_results(session_id: str, db: DbSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    results_sorted = sorted(session.results, key=lambda r: r["total_score"], reverse=True) if session.results else []

    return JSONResponse({
        "session_id": session.id,
        "session_name": session.session_name,
        "job_description": session.job_description,
        "results": {
            "scored": results_sorted
        },
        "created_at": session.timestamp.isoformat(),
        "completed": session.completed
    })

# Serve PDFs directly
@app.get("/get_pdf/{session_id}/{filename}")
async def get_pdf(session_id: str, filename: str):
    folder_path = os.path.join(UPLOAD_DIR, session_id)
    file_path = os.path.join(folder_path, filename)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=file_path, media_type="application/pdf")

# Accept CV
@app.post("/accept_cv")
async def accept_cv(session_id: str = Form(...), cv_id: str = Form(...), db: DbSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    found = False
    for r in session.results:
        if r["cv_id"] == cv_id:
            r["accepted"] = True
            r["rejected"] = False
            r["accepted_date"] = datetime.utcnow().isoformat()
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="CV not found")

    session.results = session.results
    db.commit()
    return {"message": "CV accepted"}

# Reject CV
@app.post("/reject_cv")
async def reject_cv(session_id: str = Form(...), cv_id: str = Form(...), db: DbSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    found = False
    for r in session.results:
        if r["cv_id"] == cv_id:
            r["rejected"] = True
            r["accepted"] = False
            r["rejected_date"] = datetime.utcnow().isoformat()
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="CV not found")

    session.results = session.results
    db.commit()
    return {"message": "CV rejected"}

# Get all comparison history
@app.get("/get_comparison_history")
async def get_comparison_history(db: DbSession = Depends(get_db)):
    sessions = db.query(SessionModel).order_by(SessionModel.timestamp.desc()).all()
    
    history = []
    for s in sessions:
        history.append({
            "session_id": s.id,
            "session_name": s.session_name,
            "job_description": s.job_description,
            "results": s.results,
            "created_at": s.timestamp.isoformat() if s.timestamp else None,
            "completed": s.completed
        })
    return history

# Mark session complete
@app.post("/complete_session")
async def complete_session(session_id: str = Form(...), db: DbSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.completed = True
    db.commit()
    return {"message": "Session marked as complete"}
