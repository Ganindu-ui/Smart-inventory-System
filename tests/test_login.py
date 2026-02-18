import requests

BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/users/login"

email = "ganindupabasara01@gmail.com"
password = "Ganindu5396@"

print(f"Attempting login for: {email}")

try:
    response = requests.post(LOGIN_URL, json={"email": email, "password": password})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Login Successful!")
    else:
        print("❌ Login Failed.")

except Exception as e:
    print(f"❌ Error: {e}")
