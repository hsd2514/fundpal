from langchain.tools import tool
from typing import Optional

@tool
def lookup_tax_bracket(income: float, age: int) -> str:
    """
    Look up the approximate tax bracket for an Indian citizen based on annual income and age.
    Useful for giving tax advice.
    """
    # Simplified new regime slabs for FY 24-25
    if income <= 300000:
        return "Exempt (0%)"
    elif income <= 700000:
        return "5% (Rebate available u/s 87A, effectively 0% if income <= 7L)"
    elif income <= 1000000:
        return "10% on income between 3L-7L, 15% on 7L-10L"
    elif income <= 1200000:
        return "15% on income between 10L-12L"
    elif income <= 1500000:
        return "20% on income between 12L-15L"
    else:
        return "30% on income above 15L"

@tool
def get_fd_rates(bank_type: str = "public") -> str:
    """
    Get current approximate Fixed Deposit rates.
    bank_type can be 'public' or 'private'.
    """
    if bank_type.lower() == "public":
        return "Approx 6.5% - 7.2% for 1 year tenure."
    else:
        return "Approx 7.0% - 7.75% for 1 year tenure."

@tool
def get_gold_rate() -> str:
    """
    Get the current approximate gold rate (24K).
    """
    return "Approx ₹7,200 per gram (24K)."

financial_tools = [lookup_tax_bracket, get_fd_rates, get_gold_rate]
