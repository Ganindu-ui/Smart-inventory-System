import requests

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/users/login"
PRODUCT_URL = f"{BASE_URL}/products/"

email = "ganindupabasara01@gmail.com"
password = "Ganindu5396@"

print(f"1. logging in as: {email}")

try:
    # Login
    login_res = requests.post(LOGIN_URL, json={"email": email, "password": password})
    if login_res.status_code != 200:
        print(f"❌ Login Failed: {login_res.status_code} {login_res.text}")
        exit()
    
    token = login_res.json()["access_token"]
    print("✅ Login Successful. Token obtained.")

    # Create Product
    print("\n2. Attempting to create product...")
    headers = {"Authorization": f"Bearer {token}"}
    product_payload = {
        "name": "Test Product Script",
        "description": "Created via script",
        "price": 100.0,
        "quantity": 10
    }

    res = requests.post(PRODUCT_URL, json=product_payload, headers=headers)
    
    print(f"Status Code: {res.status_code}")
    print(f"Response Body: {res.text}")

except Exception as e:
    print(f"❌ Error: {e}")
