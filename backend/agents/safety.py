from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SafetyCheck(BaseModel):
    is_safe: bool
    modified_response: Optional[str] = None
    warnings_added: List[str] = []
    blocked_reason: Optional[str] = None

class SafetyAgent:
    """
    Final checkpoint before any advice reaches user.
    Ensures all recommendations are safe and appropriate.
    """
    
    # Hard rules that NEVER change
    BLOCKED_RECOMMENDATIONS = [
        "skip_emi",
        "skip_rent", 
        "skip_medicine",
        "crypto",
        "futures_options",
        "penny_stocks",
        "chit_fund"
    ]
    
    def __init__(self):
        self.disclaimer = "💡 This is educational info, not financial advice."
    
    def check(
        self,
        response: str,
        user_profile: dict,
        recommendation_type: Optional[str] = None
    ) -> SafetyCheck:
        
        warnings = []
        modified = response
        
        # Rule 1: Block dangerous recommendations
        if recommendation_type in self.BLOCKED_RECOMMENDATIONS:
            return SafetyCheck(
                is_safe=False,
                modified_response=None,
                warnings_added=[],
                blocked_reason=f"Cannot recommend {recommendation_type}"
            )
        
        # Rule 2: Check risk alignment
        if "invest" in response.lower() or "mutual fund" in response.lower():
            if user_profile.get("risk_tolerance") == "conservative":
                # Soften investment language
                warnings.append("Note: Only consider low-risk options like FD or RD")
            
            # Check emergency fund first
            if user_profile.get("emergency_fund_months", 0) < 3:
                warnings.append("Priority: Build emergency fund before investing")
        
        # Rule 3: Check affordability
        if "save" in response.lower() or "invest" in response.lower():
            surplus = user_profile.get("monthly_surplus", 0)
            if surplus < 1000:
                warnings.append("Focus on essentials first given your current surplus")
        
        # Rule 4: Income stability check for gig workers
        if user_profile.get("income_type") == "gig":
            if "sip" in response.lower() or "recurring" in response.lower():
                warnings.append("Consider flexible savings given variable income")
        
        # Rule 5: Always add disclaimer for advice
        if any(word in response.lower() for word in ["suggest", "recommend", "should", "advice"]):
            if self.disclaimer not in response:
                modified = response + f"\n\n{self.disclaimer}"
        
        return SafetyCheck(
            is_safe=True,
            modified_response=modified,
            warnings_added=warnings,
            blocked_reason=None
        )
    
    def log_decision(self, user_id: str, check_result: SafetyCheck, context: dict):
        """Log all safety decisions for audit trail"""
        # In production, store in database
        log_entry = {
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "is_safe": check_result.is_safe,
            "warnings": check_result.warnings_added,
            "blocked": check_result.blocked_reason,
            "context": context
        }
        # db.safety_logs.insert(log_entry)
        return log_entry
