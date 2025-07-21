from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os, uuid, json, shutil
from app.services.pipeline import run_pipeline  # You’ll create this
from fastapi import Depends
from sqlalchemy.orm import Session as OrmSession
from fastapi.responses import JSONResponse
from app.models.models import Session as SessionModel
from app.models.database import SessionLocal, Base, engine

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

UPLOAD_DIR = "storage/uploads"
SESSION_DIR = "storage"

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/compare")
async def compare_upload(
    job_description: str = Form(...),
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

    # 🔁 Run pipeline immediately
    results = run_pipeline(job_description, pdf_paths)

    # 💾 Save JSON results
    with open(os.path.join(SESSION_DIR, f"{session_id}.json"), "w", encoding="utf-8") as f:
        json.dump({
            "job_description": job_description,
            "pdf_paths": pdf_paths,
            "results": results
        }, f, ensure_ascii=False, indent=2)

    # 💾 Save metadata to DB
    db_record = SessionModel(
        id=session_id,
        job_description=job_description,
        pdf_paths=pdf_paths,
        results=results
    )
    db.add(db_record)
    db.commit()

    return {"session_id": session_id}

@app.get("/get_results")
async def get_results(session_id: str, db: OrmSession = Depends(get_db)):
    db_session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not db_session.results:
        raise HTTPException(status_code=404, detail="Results not found for this session")

    return JSONResponse(content={"results": db_session.results})
