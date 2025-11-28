from typing import Dict, List, Any
import math

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
        # Mock Funds Database with expected returns (CAGR)
        self.FUNDS = {
            "Liquid": {"name": "SBI Liquid Fund", "return": 0.05, "risk": "low"},
            "Debt": {"name": "HDFC Short Term Debt", "return": 0.07, "risk": "low-moderate"},
            "Hybrid": {"name": "ICICI Pru Balanced Advantage", "return": 0.10, "risk": "moderate"},
            "Equity": {"name": "Nifty 50 Index Fund", "return": 0.12, "risk": "high"},
            "MidCap": {"name": "HDFC Mid-Cap Opportunities", "return": 0.14, "risk": "very-high"},
            "Gold": {"name": "Sovereign Gold Bond", "return": 0.08, "risk": "moderate"},
            "FD": {"name": "HDFC Bank FD", "return": 0.065, "risk": "low"}
        }

    def _get_age_based_allocation(self, age: int) -> Dict[str, Any]:
        if age < 26:
            return {
                "Equity": 0.60,
                "MidCap": 0.10,
                "Gold": 0.10,
                "Liquid": 0.20
            }
        elif age < 36:
            return {
                "Equity": 0.40,
                "Hybrid": 0.30,
                "Debt": 0.20,
                "Liquid": 0.10
            }
        elif age < 50:
            return {
                "Equity": 0.30,
                "Debt": 0.40,
                "Hybrid": 0.20,
                "Liquid": 0.10
            }
        else:
            return {
                "FD": 0.50,
                "Debt": 0.30,
                "Equity": 0.10,
                "Liquid": 0.10
            }

    def _calculate_projection(self, monthly_amount: float, allocation: Dict[str, float], years: int) -> float:
        """Calculate future value of SIP using weighted average return"""
        weighted_return = 0
        for asset, pct in allocation.items():
            fund_key = asset  # Simplified mapping
            if fund_key in self.FUNDS:
                weighted_return += self.FUNDS[fund_key]["return"] * pct
            else:
                weighted_return += 0.06 * pct # Default conservative

        # Future Value of SIP formula: P * [ (1+r)^n - 1 ] * (1+r) / r
        # r = monthly rate, n = months
        monthly_rate = weighted_return / 12
        months = years * 12
        
        if monthly_rate == 0:
            return monthly_amount * months
            
        fv = monthly_amount * ((((1 + monthly_rate) ** months) - 1) / monthly_rate) * (1 + monthly_rate)
        return round(fv)

    def generate_plan(self, user_profile: Dict, user_state: Dict) -> Dict:
        # 1. Analyze Profile
        age_group = user_profile.get("age_group", "26-35")
        age_map = {"18-25": 22, "26-35": 30, "36-50": 40, "50+": 55}
        age = age_map.get(age_group, 30)
        
        surplus = user_profile.get("monthly_surplus", 0)
        # If surplus not calculated, estimate from income - expenses
        if surplus == 0:
            income = user_profile.get("monthly_income_min", 30000)
            expenses = user_profile.get("monthly_rent", 0) + user_profile.get("monthly_emi_total", 0) + 10000 # Basic needs
            surplus = max(income - expenses, 1000)

        # 2. Determine 'How Much'
        # Conservative rule: Invest 20-30% of surplus
        recommended_amount = round(surplus * 0.3, -2) # Round to nearest 100
        if recommended_amount < 500: recommended_amount = 500

        # 3. Determine 'What' (Allocation)
        raw_allocation = self._get_age_based_allocation(age)
        
        allocation_details = {}
        for asset, pct in raw_allocation.items():
            fund_info = self.FUNDS.get(asset, {"name": "Generic Fund", "return": 0.06})
            allocation_details[asset] = {
                "pct": int(pct * 100),
                "fund": fund_info["name"],
                "expected_return": f"{int(fund_info['return']*100)}%"
            }

        # 4. Generate 'Trails' (Projections)
        projections = {
            "3_years": self._calculate_projection(recommended_amount, raw_allocation, 3),
            "5_years": self._calculate_projection(recommended_amount, raw_allocation, 5),
            "10_years": self._calculate_projection(recommended_amount, raw_allocation, 10)
        }
        
        total_invested_10y = recommended_amount * 12 * 10
        gain_10y = projections["10_years"] - total_invested_10y

        # 5. Construct the full plan
        return {
            "why": f"At age {age}, you have a long horizon. Investing ₹{recommended_amount}/mo can grow significantly due to compounding.",
            "what": allocation_details,
            "how": [
                "Complete KYC with a broker (Zerodha/Groww)",
                f"Set up an auto-debit (SIP) for ₹{recommended_amount} on the 5th of every month",
                "Review portfolio every 6 months"
            ],
            "how_much": recommended_amount,
            "projections": {
                "monthly_investment": recommended_amount,
                "corpus_10y": projections["10_years"],
                "total_invested": total_invested_10y,
                "wealth_gained": gain_10y
            },
            "risk_profile": f"{user_profile.get('risk_tolerance', 'Moderate').capitalize()}"
        }
