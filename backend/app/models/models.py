# models.py
from sqlalchemy import Column, String, Text, JSON
from .database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    job_description = Column(Text)
    pdf_paths = Column(JSON)
    results = Column(JSON, nullable=True)
    