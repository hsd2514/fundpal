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
            "gold": financial_tools[2],
            "research": financial_tools[3]
        }
        # Simple in-memory context for MVP (user_id -> context_dict)
        self.context = {}

    def _handle_investment_flow(self, user_id: str, message: str, parsed: dict, user_profile: dict, user_state: dict) -> tuple[str, dict]:
        """Centralized logic for handling investment conversations and slot filling"""
        # === SLOT FILLING LOGIC ===
        
        # 1. Merge parsed data into context
        if user_id not in self.context:
            self.context[user_id] = {}
        
        ctx = self.context[user_id]
        if parsed.amount: ctx["amount"] = parsed.amount
        if parsed.goal_name: ctx["goal"] = parsed.goal_name
        if parsed.duration_years: ctx["duration"] = parsed.duration_years
        if parsed.risk_profile: ctx["risk"] = parsed.risk_profile
        if parsed.investment_type: ctx["type"] = parsed.investment_type
        
        # 2. Check for missing fields
        missing_fields = []
        if not ctx.get("amount"): missing_fields.append("amount")
        if not ctx.get("goal"): missing_fields.append("goal")
        if not ctx.get("duration"): missing_fields.append("duration")
        

        
        # Risk is optional, default to profile
        
        response = ""
        card_data = None

        # 3. Ask for next missing field
        if missing_fields:
            next_field = missing_fields[0]
            if next_field == "amount":
                response = "How much would you like to invest?"
            elif next_field == "goal":
                response = "What is this investment for? (e.g., Buying a Car, Retirement)"
            elif next_field == "duration":
                response = "How many years do you plan to stay invested?"
        else:
            # All fields present, generate plan
            inv_type = ctx.get("type") or ("SIP" if "sip" in message.lower() else "Lumpsum")
            amount = ctx.get("amount")
            goal = ctx.get("goal")
            duration = ctx.get("duration")
            risk = ctx.get("risk")
            
            plan = self.allocation.generate_plan(
                user_profile, 
                user_state, 
                investment_type=inv_type, 
                amount_override=amount,
                goal=goal,
                duration=duration,
                risk_override=risk
            )
            
            # Clear context after success
            if user_id in self.context:
                del self.context[user_id]
            
            card_data = {
                "type": "investment_allocation",
                "title": "Your Wealth Plan",
                "subtitle": f"{plan['risk_profile']} • {inv_type}",
                "data": {
                    "allocation": plan["what"],
                    "projections": plan["projections"],
                    "steps": plan["how"]
                }
            }
            
            response = f"Here is your personalized investment plan for **{goal}**.\n\n**Why Invest?**\n{plan['why']}\n\n**How Much?**\nWe recommend starting with ₹{plan['how_much']}/month."

        return response, card_data
    
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
            if "invest" in message.lower() or "allocation" in message.lower() or parsed.investment_type or user_id in self.context:
                 response, card_data = self._handle_investment_flow(user_id, message, parsed, user_profile, user_state)
        
        elif parsed.intent == "query":
            # Status check
            decision = await self.planner.analyze(user_state)
            
            # Check if it's an investment query
            card_data = None
            if "invest" in message.lower() or "allocation" in message.lower() or parsed.investment_type or user_id in self.context:
                response, card_data = self._handle_investment_flow(user_id, message, parsed, user_profile, user_state)
                
                # If response is just the question, we use it. 
                # If it's the plan, we might want to wrap it with coach, but _handle_investment_flow returns a good response.
                # However, the original code called coach.generate_response for the plan explanation.
                # My new method returns a pre-formatted response. Let's stick with that for consistency and simplicity.
            else:

                response = await self.coach.generate_response(
                    user_profile.get("literacy_level", 2),
                    str(user_state),
                    decision.dict(),
                    "Give status update on their finances"
                )

        elif parsed.intent == "research":
            # Autonomous Research
            topic = parsed.raw_query
            research_result = self.tools["research"].run(topic)
            
            # Coach synthesizes the research
            response = await self.coach.generate_response(
                user_profile.get("literacy_level", 2),
                str(user_state),
                {},
                f"Present this research findings: {research_result}"
            )
            
            card_data = {
                "type": "research_result",
                "title": "Research Findings",
                "subtitle": "Autonomous Agent Report",
                "data": {
                    "topic": topic,
                    "summary": research_result
                }
            }
        
        else:
            # General chat - just use coach
            decision = {}
            card_data = None
            
            # Check for investment keywords even in general chat
            if "invest" in message.lower() or "allocation" in message.lower() or parsed.investment_type or user_id in self.context:
                 response, card_data = self._handle_investment_flow(user_id, message, parsed, user_profile, user_state)
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
