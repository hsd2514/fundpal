import asyncio
import sys
import os
from dotenv import load_dotenv
import json

# Add current directory to path
sys.path.append(os.getcwd())
load_dotenv()

from agents.orchestrator import AgentOrchestrator
from routes.investments import save_investment_plan, get_portfolio, InvestmentPlan

async def test_goal_flow():
    print("Testing Goal-Based Investment Flow (Refactored)...")
    
    orchestrator = AgentOrchestrator()
    user_id = "test_user_portfolio_fix"
    
    # 0. Seed Funds
    print("\n0. Seeding Funds...")
    from database.queries import save_transaction
    from agents.observer import ParsedTransaction
    await save_transaction(user_id, ParsedTransaction(
        intent="log_income",
        amount=50000.0,
        transaction_type="income",
        category="Salary",
        description="Initial Seed"
    ))

    # 1. Initial Request (Goal)
    print("\n1. User: 'I want to invest for a car'")
    await orchestrator.process_message(user_id, "I want to invest for a car")
    
    # 2. Provide Amount
    print("\n2. User: '10000'")
    await orchestrator.process_message(user_id, "10000")
    
    # 3. Provide Duration
    print("\n3. User: '3'")
    response3 = await orchestrator.process_message(user_id, "3")
    print(f"Agent: {response3['response']}")
    
    if response3.get('card') and response3['card']['type'] == 'investment_allocation':
        print("✅ Success: Plan generated.")
        
        card_data = response3['card']['data']
        allocation = card_data['allocation']
        
        # Construct InvestmentPlan object
        # We need to map the allocation format to what InvestmentPlan expects
        # InvestmentPlan.allocation is Dict[str, Dict[str, Any]]
        # The card data allocation is already in this format.
        
        # We also need risk_profile and total_amount
        # total_amount is 10000
        # risk_profile is in subtitle or we can guess
        
        plan = InvestmentPlan(
            allocation=allocation,
            risk_profile="Moderate",
            total_amount=10000.0
        )
        
        print("\n4. Saving Investment Plan (Simulating 'Start Investing')...")
        try:
            result = await save_investment_plan(user_id, plan)
            print(f"Save Result: {result}")
        except Exception as e:
            print(f"❌ Save Failed: {e}")
            return

        print("\n5. Verifying Portfolio Holdings...")
        portfolio = await get_portfolio(user_id)
        holdings = portfolio.get("holdings", [])
        
        print(f"Total Value: {portfolio.get('total_value')}")
        print(f"Holdings Count: {len(holdings)}")
        
        if len(holdings) > 0:
            print("✅ Success: Holdings found in portfolio!")
            for h in holdings:
                print(f" - {h['symbol']}: {h['quantity']} units @ {h['average_price']}")
        else:
            print("❌ Failure: No holdings found.")
            
    else:
        print("❌ Failure: No plan generated.")

if __name__ == "__main__":
    asyncio.run(test_goal_flow())
