from typing import Dict, List, Any
import math
from financial_logic import get_age_based_allocation
from services.market_data import MarketDataService

class AllocationAgent:
    """
    Dedicated agent for Fund Allocation and Investment Strategy.
    Responsibilities:
    1. Determine 'What' to invest in (Asset Allocation + Specific Funds).
    2. Explain 'Why' (Rationale based on profile).
    3. Explain 'How' (Execution steps).
    4. Recommend 'How Much' (Based on surplus).
    5. Generate 'Trails' (Projections/Returns).
    """

    def __init__(self):
        self.market_data = MarketDataService()
        # Real Funds Database with Tickers
        # Expanded Real Funds Database
        self.FUND_DATABASE = {
            "Liquid": [
                {"name": "Nippon India Liquid Fund", "ticker": "LIQUIDBEES.NS", "risk": "low"},
                {"name": "SBI Liquid Fund", "ticker": "SBIN.NS", "risk": "low"}, # Proxy
                {"name": "HDFC Liquid Fund", "ticker": "HDFCBANK.NS", "risk": "low"} # Proxy
            ],
            "Debt": [
                {"name": "HDFC Short Term Debt", "ticker": "HDFCLIFE.NS", "risk": "low-moderate"},
                {"name": "ICICI Pru All Seasons Bond", "ticker": "ICICIBANK.NS", "risk": "low-moderate"}, # Proxy
                {"name": "SBI Magnum Gilt Fund", "ticker": "SBIN.NS", "risk": "moderate"} # Proxy
            ],
            "Hybrid": [
                {"name": "ICICI Pru Balanced Advantage", "ticker": "ICICIPRULI.NS", "risk": "moderate"},
                {"name": "HDFC Balanced Advantage", "ticker": "HDFCBANK.NS", "risk": "moderate"}, # Proxy
                {"name": "SBI Equity Hybrid Fund", "ticker": "SBIN.NS", "risk": "high"} # Proxy
            ],
            "Equity": [
                {"name": "Nifty 50 ETF", "ticker": "NIFTYBEES.NS", "risk": "high"},
                {"name": "HDFC Top 100 Fund", "ticker": "HDFCBANK.NS", "risk": "high"}, # Proxy
                {"name": "ICICI Pru Bluechip", "ticker": "ICICIBANK.NS", "risk": "high"} # Proxy
            ],
            "MidCap": [
                {"name": "Nippon India ETF Nifty Midcap 150", "ticker": "MID150BEES.NS", "risk": "very-high"},
                {"name": "HDFC Mid-Cap Opportunities", "ticker": "HDFCBANK.NS", "risk": "very-high"}, # Proxy
                {"name": "Kotak Emerging Equity", "ticker": "KOTAKBANK.NS", "risk": "very-high"} # Proxy
            ],
            "Gold": [
                {"name": "Nippon India ETF Gold BeES", "ticker": "GOLDBEES.NS", "risk": "moderate"},
                {"name": "HDFC Gold ETF", "ticker": "HDFCBANK.NS", "risk": "moderate"}, # Proxy
                {"name": "SBI Gold ETF", "ticker": "SBIN.NS", "risk": "moderate"} # Proxy
            ]
        }
        
    def _get_best_fund(self, category: str) -> Dict:
        """Select a fund dynamically. For MVP, random selection to show variety."""
        import random
        candidates = self.FUND_DATABASE.get(category, [])
        if not candidates:
            return {"name": "Generic Fund", "ticker": "NIFTYBEES.NS", "risk": "moderate"}
        return random.choice(candidates)

    def _calculate_projection(self, monthly_amount: float, allocation: Dict[str, float], years: int) -> float:
        """Calculate future value of SIP using weighted average return"""
        weighted_return = 0
        for asset, pct in allocation.items():
            fund_key = asset
            # Use a static expected return for projection since live return is volatile
            # In real app, fetch historical CAGR
            expected_returns = {
                "Liquid": 0.05, "Debt": 0.07, "Hybrid": 0.10, "Equity": 0.12,
                "MidCap": 0.14, "Gold": 0.08, "FD": 0.065, "Income_Funds": 0.075
            }
            weighted_return += expected_returns.get(fund_key, 0.06) * pct

        # Future Value of SIP formula: P * [ (1+r)^n - 1 ] * (1+r) / r
        # r = monthly rate, n = months
        monthly_rate = weighted_return / 12
        months = years * 12
        
        if monthly_rate == 0:
            return monthly_amount * months
            
        fv = monthly_amount * ((((1 + monthly_rate) ** months) - 1) / monthly_rate) * (1 + monthly_rate)
        return round(fv)

    def generate_plan(self, user_profile: Dict, user_state: Dict, investment_type: str = "SIP", amount_override: float = None, goal: str = None, duration: int = None, risk_override: str = None) -> Dict:
        # 1. Analyze Profile
        age_group = user_profile.get("age_group", "26-35")
        age_map = {"18-25": 22, "26-35": 30, "36-50": 40, "50+": 55}
        age = age_map.get(age_group, 30)
        
        surplus = user_profile.get("monthly_surplus", 0)
        # If surplus not calculated, estimate from income - expenses
        if surplus == 0:
            income = user_profile.get("monthly_income_min") or 30000
            rent = user_profile.get("monthly_rent") or 0
            emi = user_profile.get("monthly_emi_total") or 0
            expenses = rent + emi + 10000 # Basic needs
            surplus = max(income - expenses, 1000)

        # 2. Determine 'How Much'
        if amount_override:
            recommended_amount = amount_override
        else:
            # Conservative rule: Invest 20-30% of surplus
            recommended_amount = round(surplus * 0.3, -2) # Round to nearest 100
            if recommended_amount < 500: recommended_amount = 500

        # 3. Determine 'What' (Allocation)
        allocation_result = get_age_based_allocation(age)
        raw_allocation = allocation_result["allocation"]
        allocation_description = allocation_result["description"]
        
        # --- GOAL-BASED ADJUSTMENTS ---
        if duration:
            if duration < 3:
                # Short Term: Safety First
                raw_allocation = {"Liquid": 0.4, "Debt": 0.4, "Gold": 0.2}
                allocation_description = "Conservative (Short-term Goal)"
            elif duration > 10:
                # Long Term: Growth Focus
                raw_allocation = {"Equity": 0.4, "MidCap": 0.3, "Gold": 0.2, "Debt": 0.1}
                allocation_description = "Aggressive (Long-term Goal)"
        
        if goal and "emergency" in goal.lower():
            raw_allocation = {"Liquid": 1.0}
            allocation_description = "Safety (Emergency Fund)"
            
        if risk_override:
             # Simple override logic for MVP
             if risk_override.lower() == "high":
                 raw_allocation = {"Equity": 0.5, "MidCap": 0.4, "Gold": 0.1}
                 allocation_description = "Aggressive (User Preference)"
             elif risk_override.lower() == "low":
                 raw_allocation = {"Debt": 0.6, "Liquid": 0.3, "Gold": 0.1}
                 allocation_description = "Conservative (User Preference)"
        # ------------------------------
        
        allocation_details = {}
        for asset, pct in raw_allocation.items():
            fund_info = self._get_best_fund(asset)
            
            # Fetch Live Price
            current_price = self.market_data.get_current_price(fund_info["ticker"])
            
            allocation_details[asset] = {
                "pct": int(pct * 100),
                "fund": fund_info["name"],
                "ticker": fund_info["ticker"],
                "current_price": f"₹{current_price}",
                "action": "BUY"
            }

        # 4. Generate 'Trails' (Projections)
        projections = {
            "3_years": self._calculate_projection(recommended_amount, raw_allocation, 3),
            "5_years": self._calculate_projection(recommended_amount, raw_allocation, 5),
            "10_years": self._calculate_projection(recommended_amount, raw_allocation, 10)
        }
        
        total_invested_10y = recommended_amount * 12 * 10
        gain_10y = projections["10_years"] - total_invested_10y

        steps = ["Complete KYC with a broker (Zerodha/Groww)"]
        if investment_type == "SIP":
            steps.append(f"Set up an auto-debit (SIP) for ₹{recommended_amount} on the 5th of every month")
        else:
            steps.append(f"Transfer ₹{recommended_amount} as a one-time Lumpsum investment")
            
        steps.append("Review portfolio every 6 months")

        # 5. Construct the full plan
        return {
            "why": f"At age {age}, {allocation_description} Investing ₹{recommended_amount} ({investment_type}) can grow significantly.",
            "what": allocation_details,
            "how": steps,
            "how_much": recommended_amount,
            "projections": {
                "monthly_investment": recommended_amount,
                "corpus_10y": projections["10_years"],
                "total_invested": total_invested_10y,
                "wealth_gained": gain_10y
            },
            "risk_profile": f"{user_profile.get('risk_tolerance', 'Moderate').capitalize()}"
        }
