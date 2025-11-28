import asyncio
import os
from dotenv import load_dotenv
from database.schema import init_db
from agents.orchestrator import AgentOrchestrator

# Load env
load_dotenv()

async def test_backend():
    print("1. Initializing Database...")
    init_db()
    print("   Database initialized.")

    print("\n2. Initializing Orchestrator...")
    orchestrator = AgentOrchestrator()
    print("   Orchestrator ready.")

    user_id = "test_user_1"
    
    # Test Cases
    messages = [
        "I earned 5000 from Uber today",
        "I spent 200 on lunch",
        "What is the current gold rate?",
        "Can I afford a new phone for 15000?",
        "How much tax do I pay if I earn 8L?"
    ]

    for msg in messages:
        print(f"\n--- User: {msg} ---")
        try:
            result = await orchestrator.process_message(user_id, msg)
            print(f"Bot: {result['response']}")
            if result.get('alerts'):
                print(f"Alerts: {result['alerts']}")
            if 'parsed' in result:
                print(f"Intent: {result['parsed'].get('intent')}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_backend())
