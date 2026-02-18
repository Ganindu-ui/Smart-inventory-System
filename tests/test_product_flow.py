import requests
import sys

BASE_URL = "http://localhost:8000"
EMAIL = "ganindupabasara01@gmail.com"
PASSWORD = "Ganindu5396@"

def test_product_flow():
    print("1. Logging in as Admin...")
    login_payload = {
        "email": EMAIL,
        "password": PASSWORD
    }
    try:
        response = requests.post(f"{BASE_URL}/users/login", json=login_payload)
        response.raise_for_status()
        token = response.json().get("access_token")
        print("   ✅ Login successful. Token obtained.")
    except Exception as e:
        print(f"   ❌ Login failed: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Response: {e.response.text}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    print("\n2. Creating Test Product...")
    product_payload = {
        "name": "Test Product A",
        "description": "A temporary product for testing",
        "price": 99.99,
        "quantity": 10
    }
    try:
        response = requests.post(f"{BASE_URL}/products/", json=product_payload, headers=headers)
        response.raise_for_status()
        product = response.json()
        product_id = product.get("id")
        print(f"   ✅ Product created. ID: {product_id}")
    except Exception as e:
        print(f"   ❌ Create product failed: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Response: {e.response.text}")
        sys.exit(1)

    print("\n3. Verifying Product in List...")
    try:
        response = requests.get(f"{BASE_URL}/products/")
        response.raise_for_status()
        products = response.json()
        found = any(p['id'] == product_id for p in products)
        if found:
            print("   ✅ Product found in list.")
        else:
            print("   ❌ Product NOT found in list.")
            sys.exit(1)
    except Exception as e:
        print(f"   ❌ List products failed: {e}")
        sys.exit(1)

    print("\n4. Deleting Test Product...")
    try:
        response = requests.delete(f"{BASE_URL}/products/{product_id}", headers=headers)
        response.raise_for_status()
        print("   ✅ Product deleted successfully.")
    except Exception as e:
        print(f"   ❌ Delete product failed: {e}")
        sys.exit(1)

    print("\n✅ API Verification Complete. Backend is working correctly.")

if __name__ == "__main__":
    test_product_flow()
