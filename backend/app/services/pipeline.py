import io
import os
import json
import uuid
import shutil
from datetime import datetime
from typing import List

import pdfplumber
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session as DbSession

from app.models.database import Base, engine, get_db
from app.models.models import Session as SessionModel
from app.services.embeddings.json_output import generate_scored_output  # Your scoring helper

app = FastAPI()

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/pdfs", StaticFiles(directory=UPLOAD_DIR), name="pdfs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Configure Gemini API
genai.configure(api_key='YOUR_API_KEY_HERE')  # Put your real key here
model = genai.GenerativeModel("gemini-1.5-flash")

def extract_text_from_pdf_file(file_bytes: bytes) -> str:
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
        if text.strip():
            return text.strip()
    except Exception as e:
        print(f"Direct text extraction failed: {e}")
    print("Falling back to OCR for image-based PDF (not implemented).")
    return text.strip()

import re

def analyze_jd_and_resume(job_description: str, resume_text: str):
    prompt = f"""
You are a professional parser. Given a job description and a resume, return a structured JSON with the following format:

{{
  "jd": {{
    "title": "<job title>",
    "skills": [<required skills>],
    "education": {{
       "degree_level": "<degree level, e.g., bachelor's, master's, phd>",
       "field": "<field of study or specialization>"
    }},
    "industry": "<industry>"
  }},
  "cvs": [
    {{
      "name": "<Candidate name (or 'Unknown')>",
      "education": [
        {{
          "degree_level": "<degree level, e.g., bachelor's, master's, phd>",
          "field": "<Field of study>"
        }}
      ],
      "skills": [<list of skills>],
      "experience": [
        {{
          "title": "<Job Title>",
          "industry": "<Industry>",
          "skills": [<skills used>],
          "start_year": <start year as integer>,
          "end_year": 2025 if "2025" in date_string else {datetime.now().year},
          "duration": <end year - start year>
        }}
      ]
    }}
  ]
}}

Instructions:

- Normalize degree levels into one of these standardized categories: Bachelor's, Master's, PhD, Other.
- Extract fields of study precisely, e.g., "Computer Science", "Data Science", "Agriculture".
- For `end_year`, if the job is current or ongoing, use the current year.
- Output valid JSON without comments or code-like syntax.

Follow this format **exactly** and avoid extra explanation or text outside the JSON.

Job Description:
{job_description}

Resume:
{resume_text}
"""
    response = model.generate_content(prompt)
    response_text = response.text.strip()

    cleaned_response = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE).strip()

    try:
        parsed = json.loads(cleaned_response)
        return parsed
    except json.JSONDecodeError as e:
        print(f"JSON parsing failed: {e}")
        return {
            "jd": {},
            "cvs": [{"name": "Unknown", "error": f"JSON parsing failed: {e}", "text": resume_text, "sections": {}}]
        }

def run_pipeline(job_description: str, pdf_paths: List[str], session_id: str):
    all_cvs = []
    jd_data = {}

    for pdf_path in pdf_paths:
        try:
            with open(pdf_path, "rb") as f:
                file_bytes = f.read()

            resume_text = extract_text_from_pdf_file(file_bytes)
            parsed = analyze_jd_and_resume(job_description, resume_text)

            base_filename = os.path.basename(pdf_path)
            unique_id = str(uuid.uuid4())

            if not jd_data and "jd" in parsed and parsed["jd"]:
                jd_data = parsed["jd"]

            if "cvs" in parsed:
                for cv in parsed["cvs"]:
                    cv["cv_id"] = f"{base_filename}_{unique_id}"
                    all_cvs.append(cv)
            elif "cv" in parsed:
                parsed["cv"]["cv_id"] = f"{base_filename}_{unique_id}"
                all_cvs.append(parsed["cv"])

        except Exception as e:
            all_cvs.append({
                "cv_id": f"error_{uuid.uuid4()}",
                "name": "Unknown",
                "error": str(e),
                "text": "",
                "sections": {}
            })

    scored_output = generate_scored_output(jd_data, all_cvs)

    return [
        {
            **score,
            "cv_id": cv.get("cv_id", "unknown"),
            "name": cv.get("name", "Unknown"),
            "accepted": False,
            "rejected": False,
            "accepted_date": None,
            "rejected_date": None,
            "pdf_url": f"http://localhost:8000/get_pdf/{session_id}/{os.path.basename(cv.get('cv_id',''))}"
        }
        for score, cv in zip(scored_output, all_cvs)
    ]


@app.post("/compare")
async def compare(
    job_description: str = Form(...),
    session_name: str = Form(None),
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
        session_name=session_name,
        job_description=job_description,
        pdf_paths=pdf_filenames,
        results=results,
        timestamp=datetime.utcnow(),
        completed=False
    )
    db.add(db_session)
    db.commit()

    return {"session_id": session_id}

# ... keep all your other endpoints unchanged ...

