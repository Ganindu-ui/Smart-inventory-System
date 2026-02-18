import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv(dotenv_path="Backend/.env", override=True)
url = os.getenv("DATABASE_URL")

email = "ganindupabasara01@gmail.com"

print(f"Checking role for: {email}")

try:
    engine = create_engine(url)
    with engine.connect() as connection:
        # Using text() for raw SQL query
        query = text("SELECT id, email, role FROM users WHERE email = :email")
        result = connection.execute(query, {"email": email}).fetchone()
        
        if result:
            print(f"✅ User Found: ID={result[0]}, Email={result[1]}, Role='{result[2]}'")
        else:
            print("❌ User not found in database.")

except Exception as e:
    print(f"❌ Database Error: {e}")
