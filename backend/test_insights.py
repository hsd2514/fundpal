import requests
import json

BASE_URL = "http://localhost:8000/api"
USER_ID = "test_user_portfolio_fix" # Use the user we seeded earlier

def test_insights():
    print(f"Testing /insights for user {USER_ID}...")
    try:
        response = requests.get(f"{BASE_URL}/insights?user_id={USER_ID}")
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print(f"Insight: {data.get('insight')}")
            print(f"Total Spend: {data.get('total_spend')}")
            print(f"Categories: {json.dumps(data.get('category_breakdown'), indent=2)}")
        else:
            print(f"Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_insights()
