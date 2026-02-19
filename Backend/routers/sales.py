# ============================================================
# SALES ROUTER
# ============================================================
# This module handles sales transaction endpoints.
# Includes endpoints for viewing, creating, and deleting sales.
# When a sale is created, inventory is automatically updated.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from datetime import datetime, timedelta, timezone
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

# ============================================================
# SALES ANALYTICS ENDPOINT
# ============================================================
@router.get("/analytics")
def get_sales_analytics(db: Session = Depends(get_db)):
    """Return sales analytics data.
    
    Computes daily revenue, monthly revenue, top selling product,
    and a 7-day daily sales chart.
    
    Returns:
        dict: Analytics data with daily_revenue, monthly_revenue,
              top_selling_product, and daily_sales_chart
    """
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Daily revenue
    daily_revenue = db.query(
        func.coalesce(func.sum(models.Sale.total_price), 0)
    ).filter(models.Sale.sale_date >= today_start).scalar()

    # Monthly revenue
    monthly_revenue = db.query(
        func.coalesce(func.sum(models.Sale.total_price), 0)
    ).filter(models.Sale.sale_date >= month_start).scalar()

    # Top selling product (by total quantity sold)
    top_product_row = db.query(
        models.Sale.product_id,
        func.sum(models.Sale.quantity).label("total_qty")
    ).group_by(models.Sale.product_id).order_by(
        func.sum(models.Sale.quantity).desc()
    ).first()

    top_selling_product = None
    if top_product_row:
        product = db.query(models.Product).filter(
            models.Product.id == top_product_row.product_id
        ).first()
        top_selling_product = {
            "id": top_product_row.product_id,
            "name": product.name if product else "Unknown",
            "total_quantity_sold": int(top_product_row.total_qty),
        }

    # Daily sales chart — last 7 days
    daily_sales_chart = []
    for i in range(6, -1, -1):
        day_start = (today_start - timedelta(days=i))
        day_end = day_start + timedelta(days=1)
        revenue = db.query(
            func.coalesce(func.sum(models.Sale.total_price), 0)
        ).filter(
            models.Sale.sale_date >= day_start,
            models.Sale.sale_date < day_end
        ).scalar()
        daily_sales_chart.append({
            "date": day_start.strftime("%b %d"),
            "revenue": float(revenue),
        })

    return {
        "daily_revenue": float(daily_revenue),
        "monthly_revenue": float(monthly_revenue),
        "top_selling_product": top_selling_product,
        "daily_sales_chart": daily_sales_chart,
    }
