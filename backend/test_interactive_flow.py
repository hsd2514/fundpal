import asyncio
import sys
import os
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())
load_dotenv()

from agents.orchestrator import AgentOrchestrator

async def test_interactive_flow():
    print("Testing Interactive Investment Flow...")
    
    orchestrator = AgentOrchestrator()
    user_id = "test_user_interactive"
    
    # 1. Ambiguous Request
    print("\n1. User: 'Invest 5000'")
    response1 = await orchestrator.process_message(user_id, "Invest 5000")
    print(f"Agent: {response1['response']}")
    
    if "Lumpsum" in response1['response'] and "SIP" in response1['response']:
        print("✅ Correctly asked for clarification.")
    else:
        print("❌ Failed to ask for clarification.")

    # 2. Explicit Request (SIP)
    print("\n2. User: 'Start a SIP of 2000'")
    response2 = await orchestrator.process_message(user_id, "Start a SIP of 2000")
    print(f"Agent: {response2['response']}")
    
    if response2['card'] and response2['card']['type'] == 'investment_allocation':
        print("✅ Correctly generated allocation plan.")
        print(f"Subtitle: {response2['card']['subtitle']}")
        if "SIP" in response2['card']['subtitle']:
             print("✅ Correctly identified SIP.")
    else:
        print("❌ Failed to generate plan.")

    # 3. Explicit Request (Lumpsum)
    print("\n3. User: 'Invest 10000 lumpsum'")
    response3 = await orchestrator.process_message(user_id, "Invest 10000 lumpsum")
    
    if response3['card'] and response3['card']['type'] == 'investment_allocation':
        print("✅ Correctly generated allocation plan.")
        print(f"Subtitle: {response3['card']['subtitle']}")
        if "Lumpsum" in response3['card']['subtitle']:
             print("✅ Correctly identified Lumpsum.")
    else:
        print("❌ Failed to generate plan.")

if __name__ == "__main__":
    asyncio.run(test_interactive_flow())
