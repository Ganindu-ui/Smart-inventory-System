import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect

# Load environment variables
load_dotenv(dotenv_path="Backend/.env", override=True)
url = os.getenv("DATABASE_URL")

print(f"Checking tables in: {url}")

try:
    engine = create_engine(url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    if "products" in tables:
        columns = [col['name'] for col in inspector.get_columns("products")]
        print(f"Columns in 'products': {columns}")

except Exception as e:
    print(f"❌ Error: {e}")
