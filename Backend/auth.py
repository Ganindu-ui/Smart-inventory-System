# ============================================================
# AUTHENTICATION AND AUTHORIZATION MODULE
# ============================================================
# This module handles password hashing, JWT token creation/
# verification, and role-based access control for the API.

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, Header
from typing import Optional

# ============================================================
# SECURITY CONFIGURATION
# ============================================================
# These values should be stored in environment variables
# in production for security. Never hardcode secrets!
SECRET_KEY = "supersecretkey"  # CHANGE THIS IN PRODUCTION!
ALGORITHM = "HS256"  # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token validity duration

# ============================================================
# PASSWORD HASHING
# ============================================================
# Initialize bcrypt password hashing context.
# Uses bcrypt algorithm for secure password storage.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"  # Auto-upgrade deprecated schemes
)

# ============================================================
# PASSWORD FUNCTIONS
# ============================================================
def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain text password against hashed password.
    
    Args:
        plain_password: Plain text password from user
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

# ============================================================
# JWT TOKEN FUNCTIONS
# ============================================================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token.
    
    Args:
        data: Dictionary containing token claims (e.g., user email, role)
        expires_delta: Custom token expiration time (optional)
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ============================================================
# AUTHENTICATION DEPENDENCY
# ============================================================
def get_current_user(authorization: str = Header(None)) -> dict:
    """Extract and validate JWT token from Authorization header.
    
    Args:
        authorization: Authorization header value (Bearer token)
        
    Returns:
        Decoded JWT payload containing user claims
        
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication scheme. Use 'Bearer' scheme."
            )
        
        # Decode JWT token and verify signature
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use 'Bearer <token>'"
        )
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

# ============================================================
# ROLE-BASED ACCESS CONTROL
# ============================================================
def require_role(required_role: str):
    """Dependency factory that checks if user has required role.
    
    Usage in endpoint:
        @router.post("/admin-only")
        def admin_endpoint(user=Depends(require_role("admin"))):
            return {...}
    
    Args:
        required_role: Required role (e.g., 'admin', 'staff')
        
    Returns:
        Dependency function that validates user role
        
    Raises:
        HTTPException: If user doesn't have required role
    """
    def role_checker(user=Depends(get_current_user)) -> dict:
        if user.get("role") != required_role:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {required_role}"
            )
        return user
    return role_checker