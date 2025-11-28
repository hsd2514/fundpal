from .observer import ObserverAgent
from .planner import PlannerAgent
from .coach import CoachAgent
from .safety import SafetyAgent
from .allocation import AllocationAgent
from .tools import financial_tools
from database.queries import get_user_state, save_transaction, get_user_profile

class AgentOrchestrator:
    def __init__(self):
        self.observer = ObserverAgent()
        self.planner = PlannerAgent()
        self.coach = CoachAgent()
        self.safety = SafetyAgent()
        self.allocation = AllocationAgent()
        self.tools = {
            "tax": financial_tools[0],
            "fd": financial_tools[1],
            "fixed deposit": financial_tools[1],
            "gold": financial_tools[2]
        }
    
    async def process_message(self, user_id: str, message: str) -> dict:
        """Main entry point for processing user messages"""
        print(f"DEBUG: Processing message for {user_id}: {message}")
        card_data = None
        
        # 1. Get user profile and state
        try:
            user_profile = await get_user_profile(user_id)
            print(f"DEBUG: Got profile: {user_profile}")
            user_state = await get_user_state(user_id)
            print(f"DEBUG: Got state: {user_state}")
        except Exception as e:
            print(f"DEBUG: Error getting profile/state: {e}")
            import traceback
            traceback.print_exc()
            raise e
        
        # 2. Parse the message
        try:
            parsed = await self.observer.parse(message)
            print(f"DEBUG: Parsed message: {parsed}")
        except Exception as e:
            print(f"DEBUG: Error parsing message: {e}")
            import traceback
            traceback.print_exc()
            raise e
        
        # 3. Tool Execution (Simple Keyword Match for MVP)
        tool_context = ""
        msg_lower = message.lower()
        for keyword, tool in self.tools.items():
            if keyword in msg_lower:
                try:
                    if tool.name == "lookup_tax_bracket":
                        # Simple mock call for MVP
                        # In real app, extract args from message
                        pass 
                    elif tool.name == "get_fd_rates":
                        result = tool.run("public")
                        tool_context += f"\n[Tool Result - FD Rates]: {result}"
                    elif tool.name == "get_gold_rate":
                        result = tool.run({})
                        tool_context += f"\n[Tool Result - Gold Rate]: {result}"
                except Exception as e:
                    print(f"Tool error: {e}")

        # 4. Handle based on intent
        if parsed.intent in ["log_income", "log_expense"]:
            # Save transaction
            print("DEBUG: Saving transaction...")
            try:
                await save_transaction(user_id, parsed)
                print("DEBUG: Transaction saved.")
            except Exception as e:
                print(f"DEBUG: Error saving transaction: {e}")
                import traceback
                traceback.print_exc()
                raise e
            
            # Update state and analyze
            try:
                user_state = await get_user_state(user_id)  # Refresh
                print(f"DEBUG: Updated state: {user_state}")
                decision = await self.planner.analyze(user_state)
                print(f"DEBUG: Planner decision: {decision}")
            except Exception as e:
                print(f"DEBUG: Error in planning: {e}")
                import traceback
                traceback.print_exc()
                raise e
            
            # Generate response
            message_goal = f"Confirm {parsed.intent} of {parsed.amount} for {parsed.category}"
            if decision.alerts:
                message_goal += f". Also warn about: {', '.join(decision.alerts)}"
            
            # Create Transaction Card Data
            card_data = {
                "type": "transaction_confirmation",
                "title": "Transaction Logged",
                "subtitle": f"{parsed.intent.replace('_', ' ').title()}",
                "data": {
                    "amount": parsed.amount,
                    "category": parsed.category,
                    "date": parsed.date or "Today",
                    "status": "Success"
                }
            }
            
            try:
                response = await self.coach.generate_response(
                    user_profile.get("literacy_level", 2),
                    str(user_state),
                    decision.dict(),
                    message_goal
                )
                print(f"DEBUG: Coach response: {response}")
            except Exception as e:
                print(f"DEBUG: Error in coach: {e}")
                import traceback
                traceback.print_exc()
                raise e
        
        elif parsed.intent == "advice":
            # Full analysis needed
            decision = await self.planner.analyze(user_state)
            
            # Add tool context to decision for coach
            if tool_context:
                # Hacky way to add context since PlannerDecision is strict
                # We'll just append it to suggestions or handle in coach
                pass

            response = await self.coach.generate_response(
                user_profile.get("literacy_level", 2),
                str(user_state),
                decision.dict(),
                f"Answer: {parsed.raw_query}. Tool info: {tool_context}"
            )

            # Check for investment keywords in advice
            if "invest" in message.lower() or "allocation" in message.lower():
                # Generate investment plan using dedicated Allocation Agent
                plan = self.allocation.generate_plan(user_profile, user_state)
                
                card_data = {
                    "type": "investment_allocation",
                    "title": "Your Wealth Plan",
                    "subtitle": plan["risk_profile"],
                    "data": {
                        "allocation": plan["what"],
                        "projections": plan["projections"],
                        "steps": plan["how"]
                    }
                }
                
                # Append reasoning to response if not already there
                if "allocation" not in response.lower():
                    response += f"\n\n**Why Invest?**\n{plan['why']}\n\n**How Much?**\nWe recommend starting with ₹{plan['how_much']}/month."
        
        elif parsed.intent == "query":
            # Status check
            decision = await self.planner.analyze(user_state)
            
            # Check if it's an investment query
            card_data = None
            if "invest" in message.lower() or "allocation" in message.lower():
                # Generate investment plan using dedicated Allocation Agent
                plan = self.allocation.generate_plan(user_profile, user_state)
                
                card_data = {
                    "type": "investment_allocation",
                    "title": "Your Wealth Plan",
                    "subtitle": plan["risk_profile"],
                    "data": {
                        "allocation": plan["what"],
                        "projections": plan["projections"],
                        "steps": plan["how"]
                    }
                }
                
                response = await self.coach.generate_response(
                    user_profile.get("literacy_level", 2),
                    str(user_state),
                    decision.dict(),
                    f"Explain this investment plan: {plan['why']}"
                )
            else:
                response = await self.coach.generate_response(
                    user_profile.get("literacy_level", 2),
                    str(user_state),
                    decision.dict(),
                    "Give status update on their finances"
                )
        
        else:
            # General chat - just use coach
            decision = {}
            card_data = None
            
            # Check for investment keywords even in general chat
            if "invest" in message.lower() or "allocation" in message.lower():
                 # Generate investment plan using dedicated Allocation Agent
                plan = self.allocation.generate_plan(user_profile, user_state)
                
                card_data = {
                    "type": "investment_allocation",
                    "title": "Your Wealth Plan",
                    "subtitle": plan["risk_profile"],
                    "data": {
                        "allocation": plan["what"],
                        "projections": plan["projections"],
                        "steps": plan["how"]
                    }
                }
                
                response = await self.coach.generate_response(
                    user_profile.get("literacy_level", 2),
                    str(user_state),
                    {},
                    f"Explain this investment plan: {plan['why']}"
                )
            else:
                response = await self.coach.generate_response(
                    user_profile.get("literacy_level", 2),
                    str(user_state),
                    {},
                    f"Respond to: {message}. Tool info: {tool_context}"
                )
        
        # 5. Safety check
        # safety.check is synchronous and takes (response, user_profile, recommendation_type)
        safety_result = self.safety.check(
            response=response,
            user_profile=user_profile,
            recommendation_type=parsed.intent
        )
        
        safe_response = safety_result.modified_response or response
        alerts = safety_result.warnings_added
        
        # Log safety decision
        self.safety.log_decision(user_id, safety_result, {"message": message})
        
        # Determine mode safely
        mode = "normal"
        if isinstance(decision, dict):
            mode = decision.get("mode", "normal")
        else:
            # It's a Pydantic model
            mode = getattr(decision, "mode", "normal")

        return {
            "response": safe_response,
            "parsed": parsed.dict(),
            "alerts": alerts,
            "mode": mode,
            "card": card_data
        }
