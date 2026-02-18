# ============================================================
# USERS ROUTER
# ============================================================
# This module handles user registration and login endpoints.
# It manages authentication and JWT token creation.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

# Create router for user endpoints
router = APIRouter()

# ============================================================
# USER REGISTRATION ENDPOINT
# ============================================================
@router.post("/register", response_model=dict)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user account.
    
    Creates a new user with hashed password and assigns role.
    
    Args:
        user (UserCreate): User registration data
        db (Session): Database session (injected)
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Hash password for secure storage
    hashed_password = auth.hash_password(user.password)

    # Create new user record
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully!"}


# ============================================================
# USER LOGIN ENDPOINT
# ============================================================
@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token.
    
    Validates email and password, creates JWT token if valid.
    
    Args:
        user (UserLogin): Login credentials (email and password)
        db (Session): Database session (injected)
        
    Returns:
        Token: JWT access token and token type
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Look up user by email
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    # Check if user exists
    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    # Verify password against stored hash
    if not auth.verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    # Create JWT token with user info
    token = auth.create_access_token(
        {"sub": db_user.email, "role": db_user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
