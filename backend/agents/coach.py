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
- If 'health_score' is low (<50), gently suggest saving.
- If 'safe_to_spend_daily' is mentioned, call it "safe daily spend".

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
- Mention "Financial Health Score" if relevant (0-100).
- Use "Safe-to-Spend Daily" to guide spending decisions.

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
- Analyze "Financial Health Score" trends.
- Use "Safe-to-Spend Daily" as a precise budget metric.

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

    async def generate_insights(self, transactions: list) -> str:
        """
        Generates a short, actionable insight based on recent transactions.
        """
        if not transactions:
            return "No transactions yet. Start spending to see insights!"
            
        # Summarize transactions for the LLM
        summary = ""
        total_expense = 0
        categories = {}
        
        for t in transactions[:10]: # Analyze last 10 txns
            if t['type'] == 'expense':
                amount = t['amount']
                cat = t.get('category', 'Uncategorized')
                total_expense += amount
                categories[cat] = categories.get(cat, 0) + amount
                summary += f"- {t['transaction_date']}: {cat} - {amount}\n"
        
        top_category = max(categories, key=categories.get) if categories else "None"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a financial analyst. Analyze the user's recent transactions and provide ONE short, actionable insight (max 2 sentences).
            Focus on spending patterns, anomalies, or encouragement.
            
            Example: "You've spent 40% of your budget on Food this week. Consider cooking at home to save for your Car goal."
            """),
            ("human", f"""
            Recent Transactions:
            {summary}
            
            Total Expense: {total_expense}
            Top Category: {top_category}
            
            Insight:""")
        ])
        
        chain = prompt | self.llm
        result = await chain.ainvoke({})
        return result.content
