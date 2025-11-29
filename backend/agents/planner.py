from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from financial_logic import calculate_health_score, calculate_safe_to_spend, check_cashflow_stress

class FinancialMode(str, Enum):
    EMERGENCY = "emergency"          # Runway < 3 days
    WARNING = "warning"              # Runway 3-7 days
    DEBT_FIRST = "debt_first"        # High interest debt
    STABILIZATION = "stabilization"  # Building emergency fund
    GOAL_FOCUS = "goal_focus"        # Working toward goals
    NORMAL = "normal"                # Everything okay

class PlannerDecision(BaseModel):
    mode: FinancialMode
    alerts: List[str]
    suggestions: List[str]
    should_warn: bool
    priority_action: Optional[str]
    health_score: float = 0.0
    safe_to_spend_daily: float = 0.0
    cashflow_stress: Optional[dict] = None
    
class PlannerAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2
        )
    
    def calculate_runway(self, balance: float, daily_essential: float) -> int:
        """Calculate how many days user can survive"""
        if daily_essential <= 0:
            return 30  # Default safe
        return int(balance / daily_essential)
    
    def calculate_budget_utilization(
        self, 
        spent: float, 
        budget: float, 
        days_elapsed: int,
        days_in_period: int
    ) -> dict:
        """Check if category is over/under budget"""
        expected_spent = (budget / days_in_period) * days_elapsed
        utilization = spent / budget if budget > 0 else 0
        
        return {
            "utilization": utilization,
            "over_budget": spent > expected_spent,
            "pace": "ahead" if spent > expected_spent else "on_track"
        }
    
    def get_investment_plan(self, user_profile: dict, user_state: dict) -> dict:
        """
        Generate investment allocation based on age and risk profile.
        Implements the 'Simple Rule Engine' logic.
        """
        age_group = user_profile.get("age_group", "26-35")
        risk_tolerance = user_profile.get("risk_tolerance", "moderate")
        
        # Mock Funds Database
        MOCK_FUNDS = {
            "Liquid": ["SBI Liquid Fund", "HDFC Liquid Fund", "ICICI Pru Liquid"],
            "Debt": ["HDFC Short Term Debt", "Kotak Bond Fund", "Axis Banking & PSU"],
            "Hybrid": ["ICICI Pru Balanced Advantage", "HDFC Balanced Advantage", "SBI Equity Hybrid"],
            "Equity": ["Nifty 50 Index Fund", "HDFC Mid-Cap Opportunities", "Parag Parikh Flexi Cap"],
            "Gold": ["Sovereign Gold Bond", "Nippon India Gold ETF"],
            "FD": ["HDFC Bank FD", "SBI FD", "Bajaj Finance FD"]
        }

        # Map age group to numeric estimate for logic
        age_map = {
            "18-25": 22,
            "26-35": 30,
            "36-50": 40,
            "50+": 55
        }
        age = age_map.get(age_group, 30)
        
        allocation = {}
        reasoning = ""
        
        # Logic based on User Request
        if age < 26:
            # Group A: 18-25 (High Growth)
            allocation = {
                "Short-term": {"asset": "Liquid", "pct": 20, "fund": MOCK_FUNDS["Liquid"][0]},
                "Long-term": {"asset": "Equity", "pct": 60, "fund": MOCK_FUNDS["Equity"][0]},
                "Very Long-term": {"asset": "Gold", "pct": 20, "fund": MOCK_FUNDS["Gold"][0]}
            }
            reasoning = "Since you're under 25, educational frameworks suggest a high equity exposure (50-70%) for long-term growth."
            
        elif age < 36:
            # Group B: 26-35 (Balanced)
            allocation = {
                "Short-term": {"asset": "Liquid", "pct": 25, "fund": MOCK_FUNDS["Liquid"][1]},
                "Medium-term": {"asset": "Hybrid", "pct": 25, "fund": MOCK_FUNDS["Hybrid"][0]},
                "Long-term": {"asset": "Equity", "pct": 35, "fund": MOCK_FUNDS["Equity"][1]},
                "Debt Stability": {"asset": "Debt", "pct": 15, "fund": MOCK_FUNDS["Debt"][0]}
            }
            reasoning = "For your age range (26-35), a balanced mix of equity and debt helps manage risk while building wealth."
            
        elif age < 51:
            # Group C: 36-50 (Stable Growth)
            allocation = {
                "Safety": {"asset": "Debt", "pct": 35, "fund": MOCK_FUNDS["Debt"][1]},
                "Moderate Growth": {"asset": "Hybrid", "pct": 25, "fund": MOCK_FUNDS["Hybrid"][1]},
                "Long-term": {"asset": "Equity", "pct": 25, "fund": MOCK_FUNDS["Equity"][2]},
                "Emergency": {"asset": "Liquid", "pct": 15, "fund": MOCK_FUNDS["Liquid"][2]}
            }
            reasoning = "At this stage, stability becomes key. We recommend shifting towards debt assets while keeping some growth."
            
        else:
            # Group D: 50+ (Preservation)
            allocation = {
                "Safety": {"asset": "FD", "pct": 60, "fund": MOCK_FUNDS["FD"][0]},
                "Income": {"asset": "Debt", "pct": 25, "fund": MOCK_FUNDS["Debt"][2]},
                "Growth": {"asset": "Equity", "pct": 5, "fund": MOCK_FUNDS["Equity"][0]},
                "Emergency": {"asset": "Liquid", "pct": 10, "fund": MOCK_FUNDS["Liquid"][0]}
            }
            reasoning = "Focus is now on capital preservation and predictable returns."
            
        # Adjust for Risk Tolerance (Simple Modifier)
        if risk_tolerance == "conservative":
            reasoning += " Adjusted for your conservative risk profile."
            # In a real engine, we'd shift % from Equity to Debt here
            
        return {
            "allocation": allocation,
            "reasoning": reasoning,
            "risk_profile": f"{risk_tolerance.capitalize()} / {age_group}"
        }

    async def analyze(self, user_state: dict) -> PlannerDecision:
        """Main planning logic based on user's financial state"""
        
        alerts = []
        suggestions = []
        mode = None
        
        # 1. Check runway
        runway = self.calculate_runway(
            user_state.get("current_balance", 0),
            user_state.get("daily_essential", 1)
        )
        
        if runway < 3:
            mode = FinancialMode.EMERGENCY
            alerts.append(f"Critical: Only {runway} days of essential money left!")
            suggestions.append("Avoid all non-essential spending")
            return PlannerDecision(
                mode=mode,
                alerts=alerts,
                suggestions=suggestions,
                should_warn=True,
                priority_action="Reduce spending immediately"
            )
        
        if runway < 7:
            mode = FinancialMode.WARNING
            alerts.append(f"Warning: Only {runway} days runway")
        
        # 2. Check emergency fund
        emergency_fund_months = user_state.get("emergency_fund_months", 0)
        if emergency_fund_months < 1:
            if not mode: mode = FinancialMode.STABILIZATION
            suggestions.append("Focus on building emergency fund first")
        
        # 3. Check high-interest debt
        if user_state.get("has_credit_card_debt", False):
            if mode != FinancialMode.EMERGENCY:
                mode = FinancialMode.DEBT_FIRST
            alerts.append("Credit card debt is costing you 36-42% per year")
            suggestions.append("Pay off credit card before investing")
        
        # 4. Check category budgets
        for category, data in user_state.get("categories", {}).items():
            util = self.calculate_budget_utilization(
                data["spent"],
                data["budget"],
                user_state.get("days_elapsed", 1),
                user_state.get("days_in_month", 30)
            )
            if util["utilization"] > 0.8:
                alerts.append(f"{category}: {int(util['utilization']*100)}% of budget used")
        
        # 5. Check upcoming obligations
        for obligation in user_state.get("upcoming", []):
            if obligation["days_until"] <= 7:
                gap = obligation["amount"] - user_state.get("available_for_obligation", 0)
                if gap > 0:
                    alerts.append(f"{obligation['name']} due in {obligation['days_until']} days, need {gap} more")
                    suggestions.append(f"Keep {obligation['amount']} aside for {obligation['name']}")
        
        # 6. Calculate Financial Health Score
        health_score = calculate_health_score(
            savings_rate=user_state.get("savings_rate", 10),
            income_stability_score=user_state.get("income_stability_score", 80),
            emergency_fund_months=emergency_fund_months
        )

        # 7. Calculate Safe-to-Spend
        # Estimate daily income
        monthly_income = user_state.get("monthly_income", 30000)
        predicted_daily_income = monthly_income / 30
        daily_essential = user_state.get("daily_essential", 500)
        
        safe_to_spend = calculate_safe_to_spend(
            predicted_income=predicted_daily_income,
            essential_expenses=daily_essential,
            goal_allocation=predicted_daily_income * 0.2 # Assume 20% goal alloc
        )

        # 8. Check Cashflow Stress
        cashflow_check = check_cashflow_stress(
            current_balance=user_state.get("current_balance", 0),
            avg_7_day_expense=user_state.get("avg_7_day_expense", 1000),
            predicted_income_7d=predicted_daily_income * 7,
            upcoming_bills_7d=user_state.get("upcoming_bills_7d", 0)
        )
        
        if cashflow_check["is_stressed"]:
            alerts.append(f"Cashflow Risk: {cashflow_check['reason']}")
            if not mode or mode == FinancialMode.NORMAL:
                mode = FinancialMode.WARNING

        return PlannerDecision(
            mode=mode if mode else FinancialMode.NORMAL,
            alerts=alerts,
            suggestions=suggestions,
            should_warn=len(alerts) > 0,
            priority_action=suggestions[0] if suggestions else None,
            health_score=health_score,
            safe_to_spend_daily=safe_to_spend,
            cashflow_stress=cashflow_check
        )
