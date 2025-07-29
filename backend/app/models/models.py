from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
from app.models.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    session_name = Column(String, unique=True, index=True)
    job_description = Column(Text)
    pdf_paths = Column(JSON)
    results = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
