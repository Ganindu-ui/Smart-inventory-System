#  Smart Inventory System

A full-stack Inventory Management System designed to manage products, monitor stock levels, and record sales efficiently with secure authentication and role-based access control.

---

##  Overview

The Smart Inventory System helps businesses manage their inventory digitally.  
It provides product management, stock tracking, and sales recording with a secure backend API and structured frontend interface.

This project demonstrates:

- Backend API development
- Database design
- Authentication & authorization
- Role-based access control
- Full-stack integration

---

##  Tech Stack

###  Backend
- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Password Hashing (bcrypt)

###  Frontend
- HTML
- CSS
- JavaScript  
*(Add React here if you used it)*

###  Database
- SQLite / MySQL / PostgreSQL *(Replace with your actual database)*

---

##  Core Features

- User Registration & Login
- JWT Token Authentication
- Role-Based Access (Admin / Staff)
- Add / Update / Delete Products
- Stock Quantity Management
- Sales Recording
- Protected API Routes
- Swagger API Documentation

---

##  Project Structure

Smart-inventory-System/
│
├── Backend/
│ ├── models/
│ ├── schemas/
│ ├── routes/
│ ├── services/
│ ├── database.py
│ └── main.py
│
├── Frontend/
│
├── tests/
│
└── README.md


---

##  Installation Guide

###  Clone the Repository

bash
git clone https://github.com/Ganindu-ui/Smart-inventory-System.git
cd Smart-inventory-System



 Backend Setup
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload


Backend will run on:

http://127.0.0.1:8000


Interactive API documentation:

http://127.0.0.1:8000/docs

 
 Frontend Setup
cd Frontend
npm install
npm start

 Authentication & Authorization

Secure password hashing

JWT token-based authentication

Role-based route protection:

Admin → Full product management

Staff → Record and manage sales


 
 Future Enhancements

Dashboard with analytics

Low-stock alert system

Export reports (CSV / Excel)

Deployment (AWS / Render / Railway)

CI/CD integration


 
 Testing

Unit tests are located inside the tests/ directory.

Run tests using:

pytest


 
 Author

Ganindu Pabasara
Computer Science Undergraduate
GitHub: https://github.com/Ganindu-ui
