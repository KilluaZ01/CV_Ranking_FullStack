from pathlib import Path

class Settings:
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR = BASE_DIR / "uploads"

settings = Settings()
