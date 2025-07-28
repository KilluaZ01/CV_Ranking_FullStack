import io
import os
import json
import pdfplumber
import google.generativeai as genai

from app.services.embeddings.json_output import generate_scored_output

# Configure Gemini API
genai.configure(api_key='AIzaSyC48R66gmb13iKVmrlRbT0wY62ysk7d9GM')
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

    print("Falling back to OCR for image-based PDF.")  # Optional OCR support can be added
    return text.strip()

import re

def analyze_jd_and_resume(job_description: str, resume_text: str):
    prompt = f"""
You are a professional parser. Given a job description and a resume, return a structured JSON with the following format:

{{
  "jd": {{
    "title": "<job title>",
    "skills": [<required skills>],
    "education": "<required education>",
    "industry": "<industry>"
  }},
  "cvs": [
    {{
      "name": "<Candidate name (or 'Unknown')>",
      "education": "<highest degree or relevant education>",
      "skills": [<list of skills>],
      "experience": [
        {{
          "title": "<Job Title>",
          "industry": "<Industry>",
          "skills": [<skills used>],
          "start_year": <start year as integer>,
          "end_year" = 2025 if "2025" in date_string else datetime.now().year,
          "duration":<end year - start year>
        }}
      ]
    }}
  ]
}}

Follow this format **exactly** and avoid extra explanation or text outside the JSON.

Job Description:
{job_description}

Resume:
{resume_text}
"""
    response = model.generate_content(prompt)
    response_text = response.text.strip()

    # Clean markdown or other wrappers from the response
    # Remove ```json
    cleaned_response = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE)
    cleaned_response = cleaned_response.strip()

    try:
        # Parse the cleaned response
        parsed = json.loads(cleaned_response)
        return parsed
    except json.JSONDecodeError as e:
        # Log the error and return a fallback structure
        print(f"JSON parsing failed: {e}")
        return {
            "jd": {},
            "cvs": [{"name": "Unknown", "error": f"JSON parsing failed: {e}", "text": resume_text, "sections": {}}]
        }

import uuid
resume_texts = {}
def run_pipeline(job_description: str, pdf_paths: list[str]):
    all_cvs = []
    jd_data = {}

    for pdf_path in pdf_paths:
        try:
            with open(pdf_path, "rb") as f:
                file_bytes = f.read()

            resume_text = extract_text_from_pdf_file(file_bytes)

            # filename = os.path.basename(pdf_path)                 # ✅ [ADDED] Use filename as key
            # resume_texts[filename] = resume_text

            parsed = analyze_jd_and_resume(job_description, resume_text)

            # Extract just the filename for reference
            base_filename = os.path.basename(pdf_path)
            unique_id = str(uuid.uuid4())  # Or use a hash of the resume_text

            # Capture JD once (from first valid response)
            if not jd_data and "jd" in parsed and parsed["jd"]:
                jd_data = parsed["jd"]

            # Add unique ID to each CV entry
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
    # with open("resume_texts.json", "w", encoding="utf-8") as f:
    #     json.dump(resume_texts, f, ensure_ascii=False, indent=2)

    scored_output = generate_scored_output(jd_data, all_cvs)

    return {
        "jd": jd_data,
        "cvs": all_cvs,
        "scored": [
            {**score, "cv_id": cv.get("cv_id", "unknown")}  # Add cv_id to scored output
            for score, cv in zip(scored_output, all_cvs)
        ]
    }
