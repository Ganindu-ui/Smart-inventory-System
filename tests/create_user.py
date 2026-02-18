import requests

BASE_URL = "http://localhost:8000"
REGISTER_URL = f"{BASE_URL}/users/register"

email = "ganindupabasara01@gmail.com"
password = "Ganindu5396@"
username = "Ganindu Pabasara"

print(f"Creating user: {email}")

try:
    response = requests.post(REGISTER_URL, json={
        "username": username,
        "email": email,
        "password": password,
        "role": "admin"  # Creating as admin so they can add products
    })
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200 or response.status_code == 201:
        print("✅ User Created Successfully!")
    else:
        print("❌ User Creation Failed.")

except Exception as e:
    print(f"❌ Error: {e}")
