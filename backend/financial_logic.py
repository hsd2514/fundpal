from typing import Dict, Any, List, Optional

def calculate_health_score(
    savings_rate: float, 
    income_stability_score: float, 
    emergency_fund_months: float
) -> float:
    """
    Calculate Financial Health Score (0-100)
    
    Formula:
    S_norm = min(S, 30) / 30 * 40      // max 40 points (Savings Rate)
    I_norm = I * 0.3                   // max 30 points (Income Stability 0-100)
    E_norm = min(E, 6) / 6 * 30        // max 30 points (Emergency Fund Months)
    """
    # 1. Savings Rate (Target 30%)
    s_norm = (min(savings_rate, 30) / 30) * 40
    
    # 2. Income Stability (0-100 input)
    i_norm = min(income_stability_score, 100) * 0.3
    
    # 3. Emergency Fund (Target 6 months)
    e_norm = (min(emergency_fund_months, 6) / 6) * 30
    
    return round(s_norm + i_norm + e_norm)

def calculate_safe_to_spend(
    predicted_income: float,
    essential_expenses: float,
    goal_allocation: float
) -> float:
    """
    Calculate Safe-to-Spend Daily amount
    
    discretionaryPool = I_pred - Ess - GoalAlloc
    safeToSpendDaily = discretionaryPool / 30
    """
    discretionary_pool = predicted_income - essential_expenses - goal_allocation
    
    # Ensure we don't return negative safe-to-spend
    if discretionary_pool < 0:
        return 0.0
        
    return round(discretionary_pool / 30, 2)

def check_cashflow_stress(
    current_balance: float,
    avg_7_day_expense: float,
    predicted_income_7d: float,
    upcoming_bills_7d: float
) -> Dict[str, Any]:
    """
    Detect Cashflow Stress
    
    Trigger alert if:
    (balance < sevenDayAvgExpense * 0.5) AND (upcomingBills > predictedIncomeNext7Days)
    """
    is_stressed = False
    reason = None
    
    low_balance_threshold = avg_7_day_expense * 0.5
    
    if (current_balance < low_balance_threshold) and (upcoming_bills_7d > predicted_income_7d):
        is_stressed = True
        reason = "Low balance relative to expenses and upcoming bills exceed income."
        
    return {
        "is_stressed": is_stressed,
        "reason": reason,
        "details": {
            "current_balance": current_balance,
            "threshold": low_balance_threshold,
            "shortfall": upcoming_bills_7d - predicted_income_7d
        }
    }

def get_age_based_allocation(age: int) -> Dict[str, Any]:
    """
    Return asset allocation based on age brackets.
    """
    if age <= 25:
        # Age 18–25
        return {
            "allocation": {
                "Liquid": 0.15,  # 10-20% -> 15%
                "Debt": 0.15,    # 10-20% -> 15%
                "Equity": 0.70   # 50-70% -> 70%
            },
            "description": "High growth focus with minimal liquidity."
        }
    elif age <= 35:
        # Age 26–35
        return {
            "allocation": {
                "Liquid": 0.10,
                "Debt": 0.10,
                "Hybrid": 0.30,
                "Equity": 0.50
            },
            "description": "Balanced growth with increasing stability."
        }
    elif age <= 50:
        # Age 36–50
        # Liquid/Debt: 20-30%, Hybrid: 20-30%, Equity: 20-30%
        # Let's use: Liquid: 10%, Debt: 20%, Hybrid: 30%, Equity: 40%
        return {
            "allocation": {
                "Liquid": 0.10,
                "Debt": 0.20,
                "Hybrid": 0.30,
                "Equity": 0.40
            },
            "description": "Stability focus with moderate growth."
        }
    else:
        # Age 50+
        # Liquid/Debt: 50-70%, Income-oriented: 20-30%, Equity: 0-10%
        return {
            "allocation": {
                "Liquid": 0.30,
                "Debt": 0.30,
                "Income_Funds": 0.30,
                "Equity": 0.10
            },
            "description": "Capital preservation and income generation."
        }
