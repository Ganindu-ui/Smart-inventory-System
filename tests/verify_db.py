import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv(dotenv_path="Backend/.env")
url = os.getenv("DATABASE_URL")

print(f"Testing Connection URL: {url}")

try:
    # Attempt connection
    engine = create_engine(url)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Connection Successful!")
        for row in result:
            print(row)
except Exception as e:
    print(f"❌ Connection Failed: {e}")
