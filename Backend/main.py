# ============================================================
# MAIN APPLICATION ENTRY POINT
# ============================================================
# This file initializes the FastAPI application, sets up
# database tables, configures CORS middleware, and registers
# all API routers for users, products, and sales management.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, product, sales
import models
from database import engine

# ============================================================
# DATABASE INITIALIZATION
# ============================================================
# Create all database tables defined in models.py if they
# don't already exist. This runs once on application startup.
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="Smart Inventory System API",
    description="API for managing inventory, products, sales, and users",
    version="1.0.0"
)

# ============================================================
# CORS CONFIGURATION
# ============================================================
# Enable Cross-Origin Resource Sharing to allow requests from
# different domains (frontend communicating with backend).
# In production, replace "*" with specific allowed origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,  # Allow credentials like cookies/auth headers
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ============================================================
# ROUTER REGISTRATION
# ============================================================
# Include routers from different modules with specific prefixes.
# Each router handles a different domain (users, products, sales).
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(sales.router, prefix="/sales", tags=["Sales"])

