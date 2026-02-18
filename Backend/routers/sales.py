# ============================================================
# SALES ROUTER
# ============================================================
# This module handles sales transaction endpoints.
# Includes endpoints for viewing, creating, and deleting sales.
# When a sale is created, inventory is automatically updated.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from datetime import datetime
import models, schemas

# Create router for sales endpoints
router = APIRouter()

# ============================================================
# GET ALL SALES ENDPOINT
# ============================================================
@router.get("/", response_model=list[schemas.Sale])
def get_sales(db: Session = Depends(get_db)):
    """Retrieve all sales transactions.
    
    Returns a list of all recorded sales in the system.
    
    Args:
        db (Session): Database session (injected)
        
    Returns:
        list[Sale]: List of all sales with details
    """
    sales = db.query(models.Sale).all()
    return sales

# ============================================================
# CREATE SALE ENDPOINT
# ============================================================
@router.post("/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    """Record a new sales transaction.
    
    Creates a sale record and automatically updates product inventory.
    Verifies product exists and has sufficient stock before creating sale.
    
    Args:
        sale (SaleCreate): Sale transaction data
        db (Session): Database session (injected)
        
    Returns:
        Sale: Created sale record with ID and timestamp
        
    Raises:
        HTTPException: If product not found or insufficient stock
    """
    # ============================================================
    # INVENTORY VALIDATION
    # ============================================================
    # Check if product exists
    product = db.query(models.Product).filter(
        models.Product.id == sale.product_id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    
    # Check if sufficient stock available
    if product.quantity < sale.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient quantity. Available: {product.quantity}"
        )
    
    # ============================================================
    # UPDATE INVENTORY AND CREATE SALE
    # ============================================================
    # Deduct sold quantity from inventory
    product.quantity -= sale.quantity
    
    # Create sale record
    new_sale = models.Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        total_price=sale.total_price
    )
    
    # Save both product and sale updates
    db.add(new_sale)
    db.add(product)
    db.commit()
    db.refresh(new_sale)
    
    return new_sale

# ============================================================
# DELETE SALE ENDPOINT
# ============================================================
@router.delete("/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    """Delete a sales transaction and restore inventory.
    
    Removes a sale record and automatically returns the sold
    quantity back to product inventory.
    
    Args:
        sale_id (int): ID of sale to delete
        db (Session): Database session (injected)
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If sale not found
    """
    # Look up sale by ID
    sale = db.query(models.Sale).filter(
        models.Sale.id == sale_id
    ).first()
    
    # Check if sale exists
    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )
    
    # ============================================================
    # RESTORE INVENTORY
    # ============================================================
    # Get the product and restore quantity
    product = db.query(models.Product).filter(
        models.Product.id == sale.product_id
    ).first()
    
    if product:
        # Return sold quantity to inventory
        product.quantity += sale.quantity
        db.add(product)
    
    # Delete the sale record
    db.delete(sale)
    db.commit()
    
    return {"message": "Sale deleted and inventory restored"}

