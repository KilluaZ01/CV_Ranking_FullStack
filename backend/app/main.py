from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os, uuid, shutil
from sqlalchemy.orm import Session as OrmSession
from fastapi.responses import JSONResponse

from app.services.pipeline import run_pipeline
from app.models.models import Session as SessionModel
from app.models.database import SessionLocal, Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/compare")
async def compare_upload(
    job_description: str = Form(...),
    session_name: str = Form(None),
    pdfs: List[UploadFile] = File(...),
    db: OrmSession = Depends(get_db)
):
    session_id = str(uuid.uuid4())
    session_path = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_path, exist_ok=True)

    pdf_paths = []
    for file in pdfs:
        file_path = os.path.join(session_path, file.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        pdf_paths.append(file_path)

    results = run_pipeline(job_description, pdf_paths)

    db_record = SessionModel(
        id=session_id,
        session_name=session_name,
        job_description=job_description,
        pdf_paths=pdf_paths,
        results=results
    )
    db.add(db_record)
    db.commit()

    return {"session_id": session_id}

@app.get("/get_results")
async def get_results(session_id: str, db: OrmSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.results:
        raise HTTPException(status_code=404, detail="No results available for this session")

    return JSONResponse(content={
        "session_id": session.id,
        "session_name": session.session_name,
        "job_description": session.job_description,
        "results": session.results
    })

@app.get("/list_sessions")
async def list_sessions(db: OrmSession = Depends(get_db)):
    sessions = db.query(SessionModel).order_by(SessionModel.timestamp.desc()).all()
    return [
        {
            "session_id": s.id,
            "session_name": s.session_name,
            "job_description": s.job_description,
            "created_at": s.timestamp.isoformat() if s.timestamp else None,
        }
        for s in sessions
    ]
