# ============================================================
# DATABASE CONFIGURATION AND SESSION MANAGEMENT
# ============================================================
# This module configures SQLAlchemy ORM settings, creates the
# database engine, session factory, and provides dependency
# injection for database sessions in API endpoints.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ============================================================
# DATABASE URL AND ENGINE
# ============================================================
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# ============================================================
# DATABASE URL AND ENGINE
# ============================================================
# Load DATABASE_URL from .env file, fallback to SQLite if not set
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")

# Create SQLAlchemy engine
# connect_args={"check_same_thread": False} is ONLY for SQLite
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args
)

# ============================================================
# SESSION FACTORY
# ============================================================
# SessionLocal creates new database sessions for each request.
# autocommit=False: Changes aren't committed until explicitly done
# autoflush=False: Objects aren't flushed to database automatically
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ============================================================
# DECLARATIVE BASE
# ============================================================
# All model classes should inherit from Base.
# This allows SQLAlchemy to track ORM-mapped classes.
Base = declarative_base()

# ============================================================
# DEPENDENCY INJECTION FUNCTION
# ============================================================
# This generator function provides database sessions to endpoint
# functions via FastAPI's Depends() mechanism. Database is
# automatically closed after each request completes.
def get_db():
    """Provide database session for dependency injection."""
    db = SessionLocal()
    try:
        yield db  # Yield session to endpoint
    finally:
        db.close()  # Ensure session is closed after use