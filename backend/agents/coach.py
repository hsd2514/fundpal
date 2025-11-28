from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Optional

class CoachAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7  # More creative for friendly responses
        )
        
        self.prompts = {
            1: self._get_low_literacy_prompt(),
            2: self._get_medium_literacy_prompt(),
            3: self._get_high_literacy_prompt()
        }
    
    def _get_low_literacy_prompt(self):
        return ChatPromptTemplate.from_messages([
            ("system", """You are FundPal, a friendly money helper. 
            
IMPORTANT: The user has LOW financial literacy. 
- Use VERY simple words
- NO jargon (no "cashflow", "volatility", "portfolio")
- Use examples from daily life
- Short sentences
- Use emojis sparingly
- Be encouraging, never judgmental

Example good response:
"You may not have enough for rent if you spend this. Better to skip it for now. 🙏"

Example bad response:
"This expenditure would adversely impact your monthly cash flow and budget allocation."
"""),
            ("human", """
User situation: {situation}
Planner decision: {decision}
What to communicate: {message_goal}

Generate a friendly, simple response:""")
        ])
    
    def _get_medium_literacy_prompt(self):
        return ChatPromptTemplate.from_messages([
            ("system", """You are FundPal, a helpful financial assistant.

The user has MEDIUM financial literacy.
- Can use terms like: budget, EMI, savings, emergency fund, interest
- Avoid complex terms like: portfolio allocation, liquidity ratio
- Be friendly but informative
- Include specific numbers
- Explain "why" briefly

Example: "Your food spending is 20% over this week's budget. Try cooking at home for the next 2 days to get back on track."
"""),
            ("human", """
User situation: {situation}
Planner decision: {decision}
What to communicate: {message_goal}

Generate a helpful response:""")
        ])
    
    def _get_high_literacy_prompt(self):
        return ChatPromptTemplate.from_messages([
            ("system", """You are FundPal, a knowledgeable financial coach.

The user has HIGH financial literacy.
- Can use terms like: SIP, mutual funds, debt-to-income ratio, compound interest
- Be concise and data-driven
- Include percentages and projections
- Skip basic explanations
- Focus on actionable insights

Example: "Your savings rate is 28% this month, up from 22%. Consider allocating the surplus to your emergency fund (currently at 1.2 months) before starting SIPs."
"""),
            ("human", """
User situation: {situation}
Planner decision: {decision}
What to communicate: {message_goal}

Generate a concise, insightful response:""")
        ])
    
    async def generate_response(
        self,
        literacy_level: int,
        situation: str,
        decision: dict,
        message_goal: str
    ) -> str:
        prompt = self.prompts.get(literacy_level, self.prompts[2])
        chain = prompt | self.llm
        
        result = await chain.ainvoke({
            "situation": situation,
            "decision": str(decision),
            "message_goal": message_goal
        })
        
        return result.content
