import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)

DB_PATH = DATA_DIR / "everlife.db"

class Settings(BaseModel):
    PROJECT_NAME: str = "Everlife AI"
    ENGINE_NAME: str = "Evermind"
    TEAM_NAME: str = "TEAM ORYVAN"
    TAGLINE: str = "Your life, connected. Your context, remembered."
    EVENT: str = "Amazon Developer Hackathon 2026"
    PRIMARY_TRACK: str = "Bee Wearable AI"
    VERSION: str = "1.0.0"
    
    # Storage
    DB_PATH: Path = DB_PATH
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    DYNAMODB_TABLE_MEMORIES: str = os.getenv("DYNAMODB_TABLE_MEMORIES", "everlife_memories")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "everlife-recordings-archive")
    AWS_ENABLED: bool = bool(os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"))
    
    # Bee Integration
    BEE_CLI_CMD: str = "bee"
    BEE_API_URL: str = os.getenv("BEE_API_URL", "https://app-api-developer.ce.bee.amazon.dev")
    BEE_SYNC_DIR: Path = BASE_DIR / "bee_data"
    
    # Ring & DoorstepOps
    RING_AUTH_TOKEN: str = os.getenv("RING_AUTH_TOKEN", "")
    
    # Fire TV
    FIRETV_DEVICE_ID: str = os.getenv("FIRETV_DEVICE_ID", "")
    
    # Alexa+
    ALEXA_SKILL_ID: str = os.getenv("ALEXA_SKILL_ID", "")

settings = Settings()
settings.BEE_SYNC_DIR.mkdir(exist_ok=True, parents=True)
