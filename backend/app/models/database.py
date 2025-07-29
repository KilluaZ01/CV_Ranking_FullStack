import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Ensure 'storage' directory exists
os.makedirs("storage", exist_ok=True)

DATABASE_URL = "sqlite:///./storage/db.sqlite3"

# Create engine after DATABASE_URL
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session factory bound to the engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

# Dependency function for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
