# ============================================================
# PYDANTIC SCHEMAS (DATA VALIDATION)
# ============================================================
# These schemas define request/response data structures and
# validation rules for API endpoints. Pydantic automatically
# validates incoming data and converts between Python and JSON.

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# ============================================================
# USER SCHEMAS
# ============================================================
class UserCreate(BaseModel):
    """Schema for user registration request.
    
    Attributes:
        username (str): User's display name
        email (str): User's email address
        password (str): Plain text password (sent over HTTPS only)
        role (str): User role ('admin' or 'staff')
    """
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6)
    role: str = Field(default="staff")

class UserLogin(BaseModel):
    """Schema for user login request.
    
    Attributes:
        email (str): User's email address
        password (str): User's password
    """
    email: str
    password: str

class Token(BaseModel):
    """Schema for JWT token response.
    
    Attributes:
        access_token (str): JWT token for authentication
        token_type (str): Token type (always 'bearer')
    """
    access_token: str
    token_type: str

# ============================================================
# PRODUCT SCHEMAS
# ============================================================
class ProductCreate(BaseModel):
    """Schema for creating/updating product.
    
    Attributes:
        name (str): Product name
        description (str): Optional product description
        price (float): Unit price
        quantity (int): Initial stock quantity
    """
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)

class Product(BaseModel):
    """Schema for product response.
    
    Attributes:
        id (int): Product ID
        name (str): Product name
        description (str): Product description
        price (float): Unit price
        quantity (int): Stock quantity
    """
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: int

    class Config:
        from_attributes = True  # Allow ORM model conversion

# ============================================================
# SALES SCHEMAS
# ============================================================
class SaleCreate(BaseModel):
    """Schema for creating a sales transaction.
    
    Attributes:
        product_id (int): ID of product being sold
        quantity (int): Number of units sold
        total_price (float): Total sale amount
    """
    product_id: int = Field(..., ge=1)
    quantity: int = Field(..., ge=1)
    total_price: float = Field(..., ge=0)

class Sale(BaseModel):
    """Schema for sale response.
    
    Attributes:
        id (int): Sale ID
        product_id (int): Product ID
        quantity (int): Units sold
        total_price (float): Total sale amount
        sale_date (datetime): When sale occurred
    """
    id: int
    product_id: int
    quantity: int
    total_price: float
    sale_date: datetime
    
    class Config:
        from_attributes = True  # Allow ORM model conversion

