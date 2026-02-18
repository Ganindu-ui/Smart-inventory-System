# ============================================================
# DATABASE MODELS (ORM)
# ============================================================
# This module defines SQLAlchemy ORM models that map to
# database tables. Each class represents a table in the database.

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from database import Base

# ============================================================
# USER MODEL
# ============================================================
class User(Base):
    """User account model for authentication and authorization.
    
    Attributes:
        id (int): Primary key, unique user identifier
        username (str): User's display name
        email (str): Unique email address for login
        password_hash (str): Bcrypt-hashed password
        role (str): User role ('admin' or 'staff')
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'admin' or 'staff'

# ============================================================
# PRODUCT MODEL
# ============================================================
class Product(Base):
    """Inventory product model.
    
    Attributes:
        id (int): Primary key, unique product identifier
        name (str): Product name
        description (str): Detailed product description
        price (float): Unit price in currency
        quantity (int): Current stock quantity
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(String)
    price = Column(Float, nullable=False)
    quantity = Column("stock_quantity", Integer, nullable=False)

# ============================================================
# SALE MODEL
# ============================================================
class Sale(Base):
    """Sales transaction model for tracking product sales.
    
    Attributes:
        id (int): Primary key, unique sale identifier
        product_id (int): Foreign key referencing Product
        quantity (int): Number of units sold
        total_price (float): Total sale amount
        sale_date (datetime): When the sale occurred
    """
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    sale_date = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

