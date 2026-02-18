# ============================================================
# PRODUCTS ROUTER
# ============================================================
# This module handles product inventory management endpoints.
# Includes endpoints for viewing, creating, and deleting products.
# Admin-only operations are protected with role-based access control.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import require_role

# Create router for product endpoints
router = APIRouter()

# ============================================================
# GET ALL PRODUCTS ENDPOINT
# ============================================================
@router.get("/", response_model=list[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    """Retrieve all products from inventory.
    
    Accessible to all authenticated users.
    
    Args:
        db (Session): Database session (injected)
        
    Returns:
        list[Product]: List of all products
    """
    products = db.query(models.Product).all()
    return products

# ============================================================
# CREATE PRODUCT ENDPOINT - ADMIN ONLY
# ============================================================
@router.post("/", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin"))
):
    """Create a new product. Admin only.
    
    Adds a new product to the inventory system.
    
    Args:
        product (ProductCreate): Product data
        db (Session): Database session (injected)
        user (dict): Current authenticated user (must be admin)
        
    Returns:
        Product: Created product with ID
        
    Raises:
        HTTPException: If user is not admin
    """
    # Create new product instance from request data
    try:
        new_product = models.Product(
            name=product.name,
            description=product.description,
            price=product.price,
            quantity=product.quantity
        )
        
        # Save to database
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        
        return new_product
    except Exception as e:
        print(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# ============================================================
# DELETE PRODUCT ENDPOINT - ADMIN ONLY
# ============================================================
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin"))
):
    """Delete a product by ID. Admin only.
    
    Removes a product from the inventory permanently.
    
    Args:
        product_id (int): ID of product to delete
        db (Session): Database session (injected)
        user (dict): Current authenticated user (must be admin)
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If product not found or user is not admin
    """
    # Look up product by ID
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    # Check if product exists
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Delete from database
    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}
